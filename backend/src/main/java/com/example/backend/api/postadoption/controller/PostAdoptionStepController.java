package com.example.backend.api.postadoption.controller;

import com.example.backend.api.adoption.dto.StepVerificationRequest;
import com.example.backend.api.postadoption.dto.PostAdoptionStepResponse;
import com.example.backend.api.postadoption.dto.PostAdoptionStepSubmitRequest;
import com.example.backend.service.postadoption.PostAdoptionStepService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "입양 후 단계 API", description = "입양 후 프로세스의 개별 단계 관리 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-adoptions/{postAdoptionId}/steps")
public class PostAdoptionStepController {

    private final PostAdoptionStepService postAdoptionStepService;

    @Operation(summary = "입양 후 단계 데이터 제출", description = "입양 후 프로세스의 특정 단계에 대한 데이터를 제출합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단계 데이터 제출 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스 또는 단계를 찾을 수 없음")
    })
    @PostMapping("/{stepInstanceId}/submit")
    public ResponseEntity<?> submitPostAdoptionStep(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 인스턴스 ID") @PathVariable Long stepInstanceId,
            @Valid @RequestBody PostAdoptionStepSubmitRequest request) {
        // TODO: 실제 단계별 데이터 DTO로 대체 필요. 현재는 임시로 String data를 받음.
        postAdoptionStepService.submitPostAdoptionStep(postAdoptionId, stepInstanceId, request.getData());
        return ResponseEntity.ok(Map.of("message", "단계 데이터가 성공적으로 제출되었습니다."));
    }

    @Operation(summary = "입양 후 단계 상세 조회", description = "입양 후 프로세스의 특정 단계 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단계 상세 조회 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionStepResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스 또는 단계를 찾을 수 없음")
    })
    @GetMapping("/{stepInstanceId}")
    public ResponseEntity<PostAdoptionStepResponse> getPostAdoptionStep(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 인스턴스 ID") @PathVariable Long stepInstanceId) {
        PostAdoptionStepResponse response = postAdoptionStepService.getPostAdoptionStep(postAdoptionId, stepInstanceId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 후 단계 승인/반려", description = "보호소 관리자가 제출된 입양 후 단계를 승인하거나 반려합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "단계 승인/반려 처리 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스 또는 단계를 찾을 수 없음")
    })
    @PostMapping("/{stepInstanceId}/verify")
    public ResponseEntity<?> verifyPostAdoptionStep(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId,
            @Parameter(description = "단계 인스턴스 ID") @PathVariable Long stepInstanceId,
            @Valid @RequestBody StepVerificationRequest request) {
        postAdoptionStepService.verifyPostAdoptionStep(stepInstanceId, request.getIsApproved(), request.getRejectionReason());
        String message = request.getIsApproved() ? "단계가 성공적으로 승인되었습니다." : "단계가 반려되었습니다.";
        return ResponseEntity.ok(Map.of("message", message));
    }

    @Operation(summary = "입양 후 프로세스 수동 완료", description = "보호소 관리자가 특정 입양 후 프로세스를 수동으로 완료 상태로 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 후 프로세스 수동 완료 성공"),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스를 찾을 수 없음")
    })
    @PostMapping("/complete")
    public ResponseEntity<?> completePostAdoptionProcess(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId) {
        postAdoptionStepService.completePostAdoptionProcess(postAdoptionId);
        return ResponseEntity.ok(Map.of("message", "입양 후 프로세스가 성공적으로 완료되었습니다."));
    }
}
