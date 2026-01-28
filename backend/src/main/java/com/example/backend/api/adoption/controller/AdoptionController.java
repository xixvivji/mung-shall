package com.example.backend.api.adoption.controller;

import com.example.backend.api.adoption.dto.AdoptionCreateRequest;
import com.example.backend.api.adoption.dto.AdoptionDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse; // NEW IMPORT
import com.example.backend.service.adoption.AdoptionService;
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

import java.util.Map;

@Tag(name = "입양 API", description = "입양 프로세스 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions")
public class AdoptionController {

    private final AdoptionService adoptionService;

    @Operation(summary = "초기 입양 프로세스 생성", description = "사용자가 '입양하기' 버튼을 눌렀을 때 호출되어 초기 입양 프로세스를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "입양 프로세스 생성 성공",
                    content = @Content(schema = @Schema(implementation = Map.class))),
            })
    @PostMapping("/")
    public ResponseEntity<?> createAdoptionProcess(@Valid @RequestBody AdoptionCreateRequest request) {
        Long adoptionId = adoptionService.createAdoptionProcess(request.getUserId(), request.getAbandonedDogId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("adoptionId", adoptionId));
    }

    @Operation(summary = "입양 상세 정보 조회", description = "특정 입양 프로세스의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 상세 정보 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionDetailResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @GetMapping("/{adoptionId}")
    public ResponseEntity<AdoptionDetailResponse> getAdoptionDetail(
            @Parameter(description = "조회할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionDetailResponse response = adoptionService.getAdoptionDetail(adoptionId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 프로세스 취소", description = "진행 중인 입양 프로세스를 취소합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 프로세스 취소 성공"),

            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @DeleteMapping("/{adoptionId}")
    public ResponseEntity<?> cancelAdoptionProcess(
            @Parameter(description = "취소할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        adoptionService.cancelAdoptionProcess(adoptionId);
        return ResponseEntity.ok(Map.of("message", "입양 프로세스가 성공적으로 취소되었습니다."));
    }

    @Operation(summary = "입양 상담 단계 정보 조회", description = "특정 입양 프로세스의 상담(Step 3) 단계 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상담 단계 정보 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionStepInstanceResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 상담 단계를 찾을 수 없음")
    })
    @GetMapping("/{adoptionId}/counseling-step")
    public ResponseEntity<AdoptionStepInstanceResponse> getAdoptionCounselingStep(
            @Parameter(description = "조회할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionStepInstanceResponse response = adoptionService.getAdoptionCounselingStep(adoptionId);
        return ResponseEntity.ok(response);
    }
}
