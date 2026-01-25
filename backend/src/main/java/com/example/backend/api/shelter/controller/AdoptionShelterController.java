package com.example.backend.api.shelter.controller;

import com.example.backend.api.adoption.dto.StepVerificationRequest;
import com.example.backend.service.adoption.AdoptionShelterService;
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
@RequestMapping("/api/shelter/adoption-steps")
public class AdoptionShelterController {

    private final AdoptionShelterService adoptionShelterService;

    @Operation(summary = "입양 단계 승인/반려", description = "보호소 관리자가 제출된 입양 단계를 승인하거나 반려합니다.")
    @PostMapping("/{stepInstanceId}/verify")
    public ResponseEntity<?> verifyAdoptionStep(
            @Parameter(description = "처리할 입양 단계 인스턴스 ID") @PathVariable Long stepInstanceId,
            @Valid @RequestBody StepVerificationRequest request) {

        adoptionShelterService.verifyAdoptionStep(stepInstanceId, request.getIsApproved(), request.getRejectionReason());

        String message = request.getIsApproved() ? "단계가 성공적으로 승인되었습니다." : "단계가 반려되었습니다.";
        return ResponseEntity.ok(Map.of("message", message));
    }
}
