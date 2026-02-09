package com.example.backend.api.adoption.controller.counseling;

import com.example.backend.api.adoption.dto.counseling.AdoptionCounselingRequest;
import com.example.backend.api.adoption.dto.counseling.AdoptionCounselingResponse;
import com.example.backend.service.adoption.counseling.AdoptionCounselingService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "입양 상담 시간 예약", description = "입양 상담 API")
@RestController
@RequestMapping("/api/adoption/counseling")
@RequiredArgsConstructor
public class AdoptionCounselingController {

    private final AdoptionCounselingService adoptionCounselingService;

    @Operation(summary = "입양 상담 예약 생성", description = "특정 입양 신청에 대한 상담 일정을 예약합니다.")
    @PostMapping
    public ResponseEntity<AdoptionCounselingResponse> createCounseling(@Valid @RequestBody AdoptionCounselingRequest request) {
        AdoptionCounselingResponse response = adoptionCounselingService.createCounseling(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "입양 상담 예약 조회", description = "ID를 통해 특정 입양 상담 예약 정보를 조회합니다.")
    @GetMapping("/{counselingId}")
    public ResponseEntity<AdoptionCounselingResponse> getCounseling(@PathVariable Long counselingId) {
        AdoptionCounselingResponse response = adoptionCounselingService.getCounseling(counselingId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 상담 예약 수정", description = "특정 입양 상담 예약의 날짜/시간을 수정합니다.")
    @PutMapping("/{counselingId}")
    public ResponseEntity<AdoptionCounselingResponse> updateCounseling(
            @PathVariable Long counselingId,
            @Valid @RequestBody AdoptionCounselingRequest request) {
        AdoptionCounselingResponse response = adoptionCounselingService.updateCounseling(counselingId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 상담 예약 취소", description = "특정 입양 상담 예약을 취소 상태로 변경합니다.")
    @DeleteMapping("/{counselingId}")
    public ResponseEntity<Void> cancelCounseling(@PathVariable Long counselingId) {
        adoptionCounselingService.cancelCounseling(counselingId);
        return ResponseEntity.noContent().build();
    }
}
