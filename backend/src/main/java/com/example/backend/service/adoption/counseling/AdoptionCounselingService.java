package com.example.backend.service.adoption.counseling;

import com.example.backend.api.adoption.dto.AdoptionStepDefResponse;
import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionCounselingService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;

    // AdoptionShelterService에서 써서 public으로, 구조 수정할것
    public AdoptionStepInstanceResponse mapToResponse(AdoptionStepInstance counselingStep) {
        return AdoptionStepInstanceResponse.builder()
                .id(counselingStep.getId())
                .stepDef(AdoptionStepDefResponse.builder()
                        .id(counselingStep.getStepDef().getId())
                        .stepOrder(counselingStep.getStepDef().getStepOrder())
                        .stepName(counselingStep.getStepDef().getStepName())
                        .description(counselingStep.getStepDef().getDescription())
                        .build())
                .status(counselingStep.getStatus())
                .submittedAt(counselingStep.getSubmittedAt())
                .approvedAt(counselingStep.getApprovedAt())
                .completedAt(counselingStep.getCompletedAt())
                .rejectionReason(counselingStep.getRejectionReason())
                .build();
    }

    /**
     * 완료된 입양 상담을 조회합니다.
     *
     * @param adoptionId 조회할 입양 프로세스 ID
     * @return 상담 단계의 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionStepInstanceResponse getAdoptionCounselingStep(Long adoptionId) {
        AdoptionStepInstance counselingStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 3)
                .orElseThrow(() -> new IllegalArgumentException("입양 상담 단계를 찾을 수 없습니다."));

        if (counselingStep.getStatus() != AdoptionStepStatus.APPROVED) {
            throw new IllegalStateException("승인된 상담만 조회할 수 있습니다.");
        }
        return mapToResponse(counselingStep);
    }

    /**
     * 입양 상담 단계를 신청합니다. (상담 날짜와 시간 지정)
     *
     * @param adoptionId         입양 프로세스 ID
     * @param counselingDateTime 희망 상담 날짜 및 시간
     * @return 업데이트된 상담 단계 정보 DTO
     */
    public AdoptionStepInstanceResponse applyForCounseling(Long adoptionId, LocalDateTime counselingDateTime) {
        AdoptionStepInstance counselingStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 3)
                .orElseThrow(() -> new IllegalArgumentException("입양 상담 단계를 찾을 수 없습니다."));

        if (counselingDateTime == null || counselingDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("상담 날짜 및 시간은 현재 시각 이후로 지정해야 합니다.");
        }

        if (counselingStep.getStatus() == AdoptionStepStatus.PENDING ||
            counselingStep.getStatus() == AdoptionStepStatus.CANCELLED ||
            counselingStep.getStatus() == AdoptionStepStatus.REJECTED) {
            counselingStep.setStatus(AdoptionStepStatus.SUBMITTED);
            counselingStep.setSubmittedAt(counselingDateTime);
            counselingStep.setApprovedAt(null);
            counselingStep.setCompletedAt(null);
            counselingStep.setRejectionReason(null);
        } else {
            throw new IllegalStateException("상담 신청이 가능한 상태가 아닙니다");
        }

        adoptionRepository.save(counselingStep.getAdoption());
        return mapToResponse(counselingStep);
    }

    /**
     * 입양 상담 단계를 수정합니다. (상담 날짜와 시간 변경)
     *
     * @param adoptionId         입양 프로세스 ID
     * @param newCounselingDateTime 새로운 희망 상담 날짜 및 시간
     * @return 업데이트된 상담 단계 정보 DTO
     */
    public AdoptionStepInstanceResponse modifyCounselingApplication(Long adoptionId, LocalDateTime newCounselingDateTime) {
        AdoptionStepInstance counselingStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 3)
                .orElseThrow(() -> new IllegalArgumentException("입양 상담 단계를 찾을 수 없습니다."));

        if (newCounselingDateTime == null || newCounselingDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("새로운 상담 날짜 및 시간은 현재 시각 이후로 지정해야 합니다.");
        }

        if (counselingStep.getStatus() == AdoptionStepStatus.PENDING) {
            counselingStep.setSubmittedAt(newCounselingDateTime);
        } else {
            throw new IllegalStateException("PENDING 상태의 상담 신청만 수정할 수 있습니다");
        }

        adoptionRepository.save(counselingStep.getAdoption());
        return mapToResponse(counselingStep);
    }

    /**
     * 입양 상담 단계를 취소합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 업데이트된 상담 단계 정보 DTO
     */
    public AdoptionStepInstanceResponse cancelCounselingApplication(Long adoptionId) {
        AdoptionStepInstance counselingStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 3)
                .orElseThrow(() -> new IllegalArgumentException("입양 상담 단계를 찾을 수 없습니다."));

        if (counselingStep.getStatus() == AdoptionStepStatus.SUBMITTED ||
            counselingStep.getStatus() == AdoptionStepStatus.APPROVED) {
            counselingStep.setStatus(AdoptionStepStatus.CANCELLED);
            counselingStep.setSubmittedAt(null);
            counselingStep.setApprovedAt(null);
            counselingStep.setCompletedAt(null);
        } else {
            throw new IllegalStateException("상담을 취소 가능한 상태가 아닙니다");
        }

        adoptionRepository.save(counselingStep.getAdoption());
        return mapToResponse(counselingStep);
    }
}
