package com.example.backend.api.postadoption.controller;

import com.example.backend.api.postadoption.dto.ChecklistItemUpdateRequest;
import com.example.backend.api.postadoption.dto.PostAdoptionResponse;
import com.example.backend.api.postadoption.dto.PostAdoptionStepDetailResponse;
import com.example.backend.api.postadoption.dto.PostAdoptionStepResponse;
import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.service.postadoption.PostAdoptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@Tag(name = "입양 후 프로세스 API", description = "입양 후 프로세스 관리 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-adoptions")
public class PostAdoptionController {

    private final PostAdoptionService postAdoptionService;

    @Operation(summary = "입양 후 프로세스 조회", description = "특정 입양 후 프로세스의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 후 프로세스 조회 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스를 찾을 수 없음")
    })
    @GetMapping("/adoption/{adoptionId}")
    public ResponseEntity<PostAdoptionResponse> getPostAdoptionProcess(
            @Parameter(description = "입양 ID") @PathVariable Long adoptionId) {
        PostAdoption postAdoption = postAdoptionService.getPostAdoptionProcess(adoptionId);
        return ResponseEntity.ok(mapToPostAdoptionResponse(postAdoption));
    }

    @Operation(summary = "입양 후 단계 상세 조회", description = "특정 입양 후 프로세스의 특정 단계 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단계 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionStepDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 단계 인스턴스를 찾을 수 없음")
    })
    @GetMapping("/{postAdoptionId}/steps/{stepOrder}")
    public ResponseEntity<PostAdoptionStepDetailResponse> getPostAdoptionStepDetail(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 순서") @PathVariable Integer stepOrder) {
        PostAdoptionStepDetailResponse response = postAdoptionService.getPostAdoptionStepDetail(postAdoptionId, stepOrder);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 후 단계 체크리스트 항목 상태 업데이트", description = "특정 입양 후 단계의 체크리스트 항목의 체크 상태를 업데이트합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "체크리스트 항목 상태 업데이트 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionStepDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 단계 인스턴스 또는 체크리스트 항목을 찾을 수 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터")
    })
    @PatchMapping("/{postAdoptionId}/steps/{stepOrder}/checklist/{checklistItemId}")
    public ResponseEntity<PostAdoptionStepDetailResponse> updateChecklistItemStatus(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 순서") @PathVariable Integer stepOrder,
            @Parameter(description = "체크리스트 항목 ID") @PathVariable Long checklistItemId,
            @RequestBody @Valid ChecklistItemUpdateRequest request) {

        PostAdoptionStepInstance updatedStepInstance = postAdoptionService.updateChecklistItemStatus(
                postAdoptionId,
                stepOrder,
                checklistItemId,
                request.getChecked()
        );
        
        PostAdoptionStepDetailResponse response = postAdoptionService.getPostAdoptionStepDetail(postAdoptionId, stepOrder);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 후 단계 제출 항목 파일 업로드", description = "특정 입양 후 단계의 제출 항목에 파일을 업로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "파일 업로드 및 제출 상태 업데이트 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionStepDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 단계 인스턴스 또는 제출 항목을 찾을 수 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 또는 파일 없음")
    })
    @PostMapping(value = "/{postAdoptionId}/steps/{stepOrder}/submissions/{submissionId}", consumes = {"multipart/form-data"})
    public ResponseEntity<PostAdoptionStepDetailResponse> uploadSubmissionFile(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 순서") @PathVariable Integer stepOrder,
            @Parameter(description = "제출 항목 ID") @PathVariable Long submissionId,
            @Parameter(description = "업로드할 파일") @RequestPart("file") MultipartFile file) {

        PostAdoptionStepInstance updatedStepInstance = postAdoptionService.uploadSubmissionFile(
                postAdoptionId,
                stepOrder,
                submissionId,
                file
        );

        // Return the updated step detail
        PostAdoptionStepDetailResponse response = postAdoptionService.getPostAdoptionStepDetail(postAdoptionId, stepOrder);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 후 단계 제출 항목 파일 삭제", description = "특정 입양 후 단계의 제출 항목에 업로드된 파일을 삭제하고 제출 상태를 초기화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "파일 삭제 및 제출 상태 초기화 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionStepDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 단계 인스턴스 또는 제출 항목을 찾을 수 없음")
    })
    @DeleteMapping("/{postAdoptionId}/steps/{stepOrder}/submissions/{submissionId}")
    public ResponseEntity<PostAdoptionStepDetailResponse> deleteSubmissionFile(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 순서") @PathVariable Integer stepOrder,
            @Parameter(description = "제출 항목 ID") @PathVariable Long submissionId) {

        PostAdoptionStepInstance updatedStepInstance = postAdoptionService.deleteSubmissionFile(
                postAdoptionId,
                stepOrder,
                submissionId
        );

        // Return the updated step detail
        PostAdoptionStepDetailResponse response = postAdoptionService.getPostAdoptionStepDetail(postAdoptionId, stepOrder);
        return ResponseEntity.ok(response);
    }

    private PostAdoptionResponse mapToPostAdoptionResponse(PostAdoption postAdoption) {
        PostAdoptionResponse response = new PostAdoptionResponse();
        response.setId(postAdoption.getId());
        response.setAdoptionId(postAdoption.getAdoption().getId());
        response.setCreatedAt(postAdoption.getCreatedAt());
        response.setUpdatedAt(postAdoption.getUpdatedAt());
        
        List<PostAdoptionStepResponse> stepResponses = postAdoption.getStepInstances().stream()
                .map(this::mapToPostAdoptionStepResponse)
                .collect(Collectors.toList());
        response.setSteps(stepResponses);
        
        return response;
    }

    private PostAdoptionStepResponse mapToPostAdoptionStepResponse(PostAdoptionStepInstance stepInstance) {
        PostAdoptionStepResponse stepResponse = new PostAdoptionStepResponse();
        stepResponse.setId(stepInstance.getId());
        stepResponse.setStepName(stepInstance.getStepName());
        stepResponse.setDescription(stepInstance.getDescription());
        stepResponse.setStepOrder(stepInstance.getStepOrder());
        stepResponse.setSubmittedAt(stepInstance.getSubmittedAt());
        stepResponse.setCompletedAt(stepInstance.getCompletedAt());
        stepResponse.setRejectionReason(stepInstance.getRejectionReason());
        return stepResponse;
    }
}

