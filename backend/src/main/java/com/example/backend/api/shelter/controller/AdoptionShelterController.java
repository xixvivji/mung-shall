package com.example.backend.api.shelter.controller;

import com.example.backend.api.adoption.dto.StepVerificationRequest;
import com.example.backend.service.shelter.AdoptionShelterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
