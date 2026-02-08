package com.example.backend.api.postadoption.controller;

import com.example.backend.service.ai.AiVideoAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-adoptions/{postAdoptionId}/training-videos")
@Tag(name = "Post-adoption training video API", description = "Analyze post-adoption training videos.")
public class PostAdoptionTrainingVideoController {

    private final AiVideoAnalysisService aiVideoAnalysisService;

    @Operation(summary = "Analyze training video", description = "Uploads a training video and returns the analyzed video.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Analysis succeeded"),
            @ApiResponse(responseCode = "400", description = "Bad request"),
            @ApiResponse(responseCode = "500", description = "Analysis failed")
    })
    @PostMapping(value = "/analyze", consumes = {"multipart/form-data"})
    public ResponseEntity<byte[]> analyzeTrainingVideo(
            @Parameter(description = "Post-adoption process ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "Training video file", required = true)
            @RequestPart("file") MultipartFile file,
            @Parameter(description = "Target action", required = true)
            @RequestPart("targetAction") String targetAction,
            @Parameter(description = "Target duration in seconds", required = true)
            @RequestPart("targetDuration") Double targetDuration
    ) {
        ResponseEntity<byte[]> aiResponse = aiVideoAnalysisService.analyzeVideo(
                file,
                targetAction,
                targetDuration
        );

        HttpHeaders responseHeaders = new HttpHeaders();
        MediaType contentType = aiResponse.getHeaders().getContentType();
        if (contentType != null) {
            responseHeaders.setContentType(contentType);
        }

        String contentDisposition = aiResponse.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
        if (contentDisposition != null) {
            responseHeaders.set(HttpHeaders.CONTENT_DISPOSITION, contentDisposition);
        }

        String analysisHeader = aiResponse.getHeaders().getFirst("X-Analysis-Result");
        if (analysisHeader != null) {
            responseHeaders.set("X-Analysis-Result", analysisHeader);
        }

        byte[] body = aiResponse.getBody();
        if (body != null) {
            responseHeaders.setContentLength(body.length);
        }

        return new ResponseEntity<>(body, responseHeaders, aiResponse.getStatusCode());
    }
}
