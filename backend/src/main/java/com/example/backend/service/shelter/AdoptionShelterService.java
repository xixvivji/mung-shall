package com.example.backend.service.shelter;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.step.AdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionShelterService {

    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionRepository adoptionRepository; // Added this dependency

    /**
     * 보호소 관리자가 입양 단계를 승인하거나 반려합니다.
     * @param stepInstanceId 처리할 단계 인스턴스 ID
     * @param isApproved 승인 여부
     * @param rejectionReason 반려 시 사유
     */
    public void verifyAdoptionStep(Long stepInstanceId, boolean isApproved, String rejectionReason) {
        AdoptionStepInstance currentStep = adoptionStepInstanceRepository.findById(stepInstanceId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption step instance not found with ID: " + stepInstanceId));

        // TODO: 현재 로그인된 보호소 관리자가 이 입양 건을 처리할 권한이 있는지 확인하는 로직 추가 필요
        // (예: currentStep.getAdoption().getShelter().getId() == loggedInShelterId)

        if (currentStep.getStatus() != AdoptionStepStatus.SUBMITTED) {
            throw new IllegalStateException("Step is not in a submitted state. Current state: " + currentStep.getStatus());
        }

        if (isApproved) {
            approveStep(currentStep);
        } else {
            rejectStep(currentStep, rejectionReason);
        }
    }

    private void approveStep(AdoptionStepInstance currentStep) {
        currentStep.setStatus(AdoptionStepStatus.APPROVED);
        currentStep.setApprovedAt(LocalDateTime.now());
        // TODO: Set approver from security context
        // currentStep.setApprover(loggedInUser);
        adoptionStepInstanceRepository.save(currentStep);

        // Find next step and activate it
        activateNextStep(currentStep);
    }

    private void rejectStep(AdoptionStepInstance step, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("반려 사유를 반드시 입력해야 합니다.");
        }
        step.setStatus(AdoptionStepStatus.REJECTED);
        step.setRejectionReason(reason);
        // TODO: Set approver from security context
        // step.setApprover(loggedInUser);
        adoptionStepInstanceRepository.save(step);
    }

    private void activateNextStep(AdoptionStepInstance currentStep) {
        Adoption adoption = currentStep.getAdoption();
        List<AdoptionStepInstance> allSteps = adoptionStepInstanceRepository.findByAdoptionIdOrderByStepDefStepOrderAsc(adoption.getId());

        // 현재 단계 다음의 단계를 찾음
        int currentIndex = allSteps.indexOf(currentStep);
        if (currentIndex > -1 && currentIndex < allSteps.size() - 1) {
            AdoptionStepInstance nextStep = allSteps.get(currentIndex + 1);
            if (nextStep.getStatus() == AdoptionStepStatus.NOT_STARTED) {
                nextStep.setStatus(AdoptionStepStatus.PENDING);
                adoptionStepInstanceRepository.save(nextStep);
            }
        } else {
            // 마지막 단계였을 경우, 전체 입양 프로세스를 완료 상태로 변경
            adoption.setProcessStatus(AdoptionProcessStatus.COMPLETED);
            adoptionRepository.save(adoption); // Explicitly save the adoption
        }
    }

    /**
     * 보호소 관리자가 입양 프로세스를 수동으로 완료시킵니다.
     * @param adoptionId 완료할 입양 프로세스 ID
     */
    public void completeAdoptionProcess(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        if (adoption.getProcessStatus() == AdoptionProcessStatus.COMPLETED || adoption.getProcessStatus() == AdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 프로세스입니다.");
        }

        // TODO: 현재 로그인된 보호소 관리자가 이 입양 건을 처리할 권한이 있는지 확인하는 로직 추가 필요

        // 모든 단계가 정확히 APPROVED 상태인지 확인 (COMPLETED 상태는 허용하지 않음)
        boolean allStepsApproved = adoption.getSteps().stream()
                .allMatch(step -> step.getStatus() == AdoptionStepStatus.APPROVED);

        if (!allStepsApproved) {
            throw new IllegalStateException("모든 입양 단계가 승인(APPROVED) 상태여야 최종 완료할 수 있습니다.");
        }

        adoption.setProcessStatus(AdoptionProcessStatus.COMPLETED);

        // 모든 APPROVED 상태의 단계들을 COMPLETED 처리
        adoption.getSteps().forEach(step -> {
            // 모든 단계가 APPROVED임을 위에서 확인했으므로, 다시 상태 확인은 필요 없음
            step.setStatus(AdoptionStepStatus.COMPLETED);
            step.setCompletedAt(LocalDateTime.now());
            adoptionStepInstanceRepository.save(step); // 변경된 stepInstance 저장
        });

        adoptionRepository.save(adoption);
    }
}
