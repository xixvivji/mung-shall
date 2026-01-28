package com.example.backend.api.shelter.controller;

import com.example.backend.api.adoption.dto.AdoptionDetailResponse;
import com.example.backend.api.adoption.dto.StepVerificationRequest;
import com.example.backend.api.adoption.dto.shelter.ShelterAdoptionUserResponse;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.shelter.AdoptionShelterService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "보호소 입양 관리 API", description = "보호소 관리자의 입양 프로세스 관리 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/shelter") // Changed base path to /api/shelter
public class AdoptionShelterController {

    private final AdoptionShelterService adoptionShelterService;

    @Operation(summary = "입양 단계 승인/반려", description = "보호소 관리자가 제출된 입양 단계를 승인하거나 반려합니다.")
    @PostMapping("/adoption-steps/{stepInstanceId}/verify")
    public ResponseEntity<?> verifyAdoptionStep(
            @Parameter(description = "처리할 입양 단계 인스턴스 ID") @PathVariable Long stepInstanceId,
            @Valid @RequestBody StepVerificationRequest request) {

        adoptionShelterService.verifyAdoptionStep(stepInstanceId, request.getIsApproved(), request.getRejectionReason());

        String message = request.getIsApproved() ? "단계가 성공적으로 승인되었습니다." : "단계가 반려되었습니다.";
        return ResponseEntity.ok(Map.of("message", message));
    }

    @Operation(summary = "입양 프로세스 수동 완료", description = "보호소 관리자가 특정 입양 프로세스를 수동으로 완료 상태로 변경합니다.")
    @PostMapping("/adoptions/{adoptionId}/complete")
    public ResponseEntity<?> completeAdoptionProcess(
            @Parameter(description = "완료할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        adoptionShelterService.completeAdoptionProcess(adoptionId);
        return ResponseEntity.ok(Map.of("message", "입양 프로세스가 성공적으로 완료되었습니다."));
    }

    @Operation(summary = "보호소 강아지 입양 신청자 목록 조회", description = "보호소에 소속된 강아지들의 입양 신청자 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 신청자 목록 조회 성공",
                    content = @Content(schema = @Schema(implementation = ShelterAdoptionUserResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 또는 보호소 권한 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터")
    })
    @GetMapping("/adoptions/adopters")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<List<ShelterAdoptionUserResponse>> getAdoptersForShelterDogs(
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal,
            @Parameter(description = "조회할 입양 진행 상태 (IN_PROGRESS 또는 COMPLETED)")
            @RequestParam AdoptionProcessStatus status) {
        List<ShelterAdoptionUserResponse> response = adoptionShelterService.getAdoptersForShelterDogs(userPrincipal.getUserId(), status);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "보호소 강아지 특정 입양 상세 정보 조회", description = "보호소에 소속된 강아지에 대한 특정 입양의 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 상세 정보 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionDetailResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자 또는 보호소 권한 없음"),
            @ApiResponse(responseCode = "403", description = "해당 입양 정보에 접근할 권한 없음"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @GetMapping("/adoptions/{adoptionId}")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<AdoptionDetailResponse> getShelterAdoptionDetail(
            @AuthenticationPrincipal CustomUserPrincipal userPrincipal,
            @Parameter(description = "조회할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionDetailResponse response = adoptionShelterService.getShelterAdoptionDetail(userPrincipal.getUserId(), adoptionId);
        return ResponseEntity.ok(response);
    }
}
