package com.example.backend.service.adoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
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
        currentStep.setStatus(AdoptionStepStatus.COMPLETED);
        currentStep.setCompletedAt(LocalDateTime.now());
        // TODO: Set approver from security context
        // currentStep.setApprover(loggedInUser);
        adoptionStepInstanceRepository.save(currentStep);

        // 다음 단계가 있는지 확인하고 활성화
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
            // adoptionRepository.save(adoption)은 cascade 설정에 따라 필요 없을 수 있음
        }
    }
}
