package com.example.backend.api.postadoption.controller;

import com.example.backend.api.postadoption.dto.PostAdoptionTrainingVideoAnalyzeJobResponse;
import com.example.backend.api.postadoption.dto.PostAdoptionTrainingVideoAnalyzeRequest;
import com.example.backend.service.ai.AiVideoAnalysisJobService;
import com.example.backend.service.ai.AiVideoAnalysisJobService.DownloadPayload;
import com.example.backend.service.ai.AiVideoAnalysisJobService.JobView;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-adoptions/{postAdoptionId}/training-videos")
@Tag(name = "Post-adoption training video API", description = "Analyze post-adoption training videos.")
public class PostAdoptionTrainingVideoController {

    private final AiVideoAnalysisJobService aiVideoAnalysisJobService;

    @Operation(
            summary = "Analyze training video",
            description = "Queues a training video analysis job and returns its status and download URLs.",
            requestBody = @RequestBody(
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(implementation = PostAdoptionTrainingVideoAnalyzeRequest.class)
                    )
            )
    )
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Analysis queued"),
            @ApiResponse(responseCode = "400", description = "Bad request")
    })
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostAdoptionTrainingVideoAnalyzeJobResponse> analyzeTrainingVideo(
            @Parameter(description = "Post-adoption process ID", required = true)
            @PathVariable Long postAdoptionId,
            @Valid @ModelAttribute PostAdoptionTrainingVideoAnalyzeRequest request
    ) {
        JobView job = aiVideoAnalysisJobService.submitJob(
                postAdoptionId,
                request.getFile(),
                request.getTargetAction(),
                request.getTargetDuration()
        );

        String statusUrl = buildStatusUrl(postAdoptionId, job.getJobId());
        String downloadUrl = buildDownloadUrl(postAdoptionId, job.getJobId());

        PostAdoptionTrainingVideoAnalyzeJobResponse response = buildJobResponse(
                job,
                statusUrl,
                downloadUrl
        );
        return ResponseEntity.accepted().body(response);
    }

    @Operation(summary = "Get analyze status", description = "Returns the status of training video analysis.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status retrieved"),
            @ApiResponse(responseCode = "202", description = "Analysis still in progress"),
            @ApiResponse(responseCode = "404", description = "Job not found")
    })
    @GetMapping("/analyze/{jobId}")
    public ResponseEntity<PostAdoptionTrainingVideoAnalyzeJobResponse> getAnalyzeStatus(
            @Parameter(description = "Post-adoption process ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "Analysis job ID", required = true)
            @PathVariable String jobId
    ) {
        JobView job = aiVideoAnalysisJobService.getJobView(postAdoptionId, jobId);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        String statusUrl = buildStatusUrl(postAdoptionId, jobId);
        String downloadUrl = buildDownloadUrl(postAdoptionId, jobId);

        PostAdoptionTrainingVideoAnalyzeJobResponse response = buildJobResponse(
                job,
                statusUrl,
                downloadUrl
        );

        HttpStatus status = job.getStatus() == AiVideoAnalysisJobService.Status.SUCCEEDED
                || job.getStatus() == AiVideoAnalysisJobService.Status.FAILED
                ? HttpStatus.OK
                : HttpStatus.ACCEPTED;
        return ResponseEntity.status(status).body(response);
    }

    @Operation(summary = "Download analyzed video", description = "Downloads the analyzed training video when ready.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Download succeeded"),
            @ApiResponse(responseCode = "202", description = "Analysis still in progress"),
            @ApiResponse(responseCode = "404", description = "Job not found"),
            @ApiResponse(responseCode = "500", description = "Analysis failed")
    })
    @GetMapping("/analyze/{jobId}/download")
    public ResponseEntity<?> downloadAnalyzeResult(
            @Parameter(description = "Post-adoption process ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "Analysis job ID", required = true)
            @PathVariable String jobId
    ) {
        JobView job = aiVideoAnalysisJobService.getJobView(postAdoptionId, jobId);
        if (job == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        if (job.getStatus() == AiVideoAnalysisJobService.Status.PROCESSING
                || job.getStatus() == AiVideoAnalysisJobService.Status.QUEUED) {
            String statusUrl = buildStatusUrl(postAdoptionId, jobId);
            String downloadUrl = buildDownloadUrl(postAdoptionId, jobId);
            PostAdoptionTrainingVideoAnalyzeJobResponse response = buildJobResponse(
                    job,
                    statusUrl,
                    downloadUrl
            );
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
        }

        if (job.getStatus() == AiVideoAnalysisJobService.Status.FAILED) {
            String statusUrl = buildStatusUrl(postAdoptionId, jobId);
            String downloadUrl = buildDownloadUrl(postAdoptionId, jobId);
            PostAdoptionTrainingVideoAnalyzeJobResponse response = buildJobResponse(
                    job,
                    statusUrl,
                    downloadUrl
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        DownloadPayload payload = aiVideoAnalysisJobService.loadResult(postAdoptionId, jobId);
        if (payload == null || payload.getBody() == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }

        HttpHeaders responseHeaders = new HttpHeaders();
        if (payload.getContentType() != null) {
            responseHeaders.setContentType(MediaType.parseMediaType(payload.getContentType()));
        }
        if (payload.getContentDisposition() != null) {
            responseHeaders.set(HttpHeaders.CONTENT_DISPOSITION, payload.getContentDisposition());
        }
        if (payload.getAnalysisHeader() != null) {
            responseHeaders.set("X-Analysis-Result", payload.getAnalysisHeader());
        }
        responseHeaders.setContentLength(payload.getBody().length);

        return new ResponseEntity<>(payload.getBody(), responseHeaders, HttpStatus.OK);
    }

    private PostAdoptionTrainingVideoAnalyzeJobResponse buildJobResponse(
            JobView job,
            String statusUrl,
            String downloadUrl
    ) {
        PostAdoptionTrainingVideoAnalyzeJobResponse response = new PostAdoptionTrainingVideoAnalyzeJobResponse();
        response.setJobId(job.getJobId());
        response.setStatus(job.getStatus().name());
        response.setStatusUrl(statusUrl);
        response.setDownloadUrl(downloadUrl);
        response.setError(job.getError());
        return response;
    }

    private String buildStatusUrl(Long postAdoptionId, String jobId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/post-adoptions/{postAdoptionId}/training-videos/analyze/{jobId}")
                .buildAndExpand(postAdoptionId, jobId)
                .toUriString();
    }

    private String buildDownloadUrl(Long postAdoptionId, String jobId) {
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/post-adoptions/{postAdoptionId}/training-videos/analyze/{jobId}/download")
                .buildAndExpand(postAdoptionId, jobId)
                .toUriString();
    }
}
