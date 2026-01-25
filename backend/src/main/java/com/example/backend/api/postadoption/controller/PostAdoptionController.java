package com.example.backend.api.postadoption.controller;

import com.example.backend.api.postadoption.dto.PostAdoptionCreateRequest;
import com.example.backend.api.postadoption.dto.PostAdoptionResponse;
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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "입양 후 프로세스 API", description = "입양 후 프로세스 관리 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/post-adoptions")
public class PostAdoptionController {

    private final PostAdoptionService postAdoptionService;

    @Operation(summary = "입양 후 프로세스 시작", description = "입양 완료 후 입양 후 프로세스를 시작합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "입양 후 프로세스 시작 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 또는 이미 프로세스가 존재함"),
            @ApiResponse(responseCode = "404", description = "해당 입양을 찾을 수 없음")
    })
    @PostMapping("/start")
    public ResponseEntity<PostAdoptionResponse> startPostAdoptionProcess(@Valid @RequestBody PostAdoptionCreateRequest request) {
        PostAdoption postAdoption = postAdoptionService.startPostAdoptionProcess(request.getAdoptionId());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToPostAdoptionResponse(postAdoption));
    }

    @Operation(summary = "입양 후 프로세스 조회", description = "특정 입양 후 프로세스의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 후 프로세스 조회 성공",
                    content = @Content(schema = @Schema(implementation = PostAdoptionResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스를 찾을 수 없음")
    })
    @GetMapping("/{postAdoptionId}")
    public ResponseEntity<PostAdoptionResponse> getPostAdoptionProcess(
            @Parameter(description = "입양 후 프로세스 ID") @PathVariable Long postAdoptionId) {
        PostAdoption postAdoption = postAdoptionService.getPostAdoptionProcess(postAdoptionId);
        return ResponseEntity.ok(mapToPostAdoptionResponse(postAdoption));
    }

    @Operation(summary = "입양 후 프로세스 취소", description = "진행 중인 입양 후 프로세스를 취소합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 후 프로세스 취소 성공"),
            @ApiResponse(responseCode = "404", description = "해당 입양 후 프로세스를 찾을 수 없음")
    })
    @DeleteMapping("/{postAdoptionId}")
    public ResponseEntity<?> cancelPostAdoptionProcess(
            @Parameter(description = "취소할 입양 후 프로세스 ID") @PathVariable Long postAdoptionId) {
        postAdoptionService.cancelPostAdoptionProcess(postAdoptionId);
        return ResponseEntity.ok(Map.of("message", "입양 후 프로세스가 성공적으로 취소되었습니다."));
    }

    private PostAdoptionResponse mapToPostAdoptionResponse(PostAdoption postAdoption) {
        PostAdoptionResponse response = new PostAdoptionResponse();
        response.setId(postAdoption.getId());
        response.setAdoptionId(postAdoption.getAdoption().getId());
        response.setProcessStatus(postAdoption.getProcessStatus());
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
        stepResponse.setStatus(stepInstance.getStatus());
        stepResponse.setSubmittedAt(stepInstance.getSubmittedAt());
        stepResponse.setCompletedAt(stepInstance.getCompletedAt());
        stepResponse.setRejectionReason(stepInstance.getRejectionReason());
        return stepResponse;
    }
}
