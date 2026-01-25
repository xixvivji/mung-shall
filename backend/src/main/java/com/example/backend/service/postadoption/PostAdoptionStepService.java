package com.example.backend.service.postadoption;

import com.example.backend.api.postadoption.dto.PostAdoptionStepResponse;
import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.enums.PostAdoptionProcessStatus;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepStatus;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostAdoptionStepService {

    private final PostAdoptionRepository postAdoptionRepository;
    private final PostAdoptionStepInstanceRepository postAdoptionStepInstanceRepository;

    /**
     * 보호소 관리자가 입양 후 단계를 승인하거나 반려합니다.
     * @param stepInstanceId 처리할 단계 인스턴스 ID
     * @param isApproved 승인 여부
     * @param rejectionReason 반려 시 사유
     */
    public void verifyPostAdoptionStep(Long stepInstanceId, boolean isApproved, String rejectionReason) {
        PostAdoptionStepInstance currentStep = postAdoptionStepInstanceRepository.findById(stepInstanceId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step instance not found with ID: " + stepInstanceId));

        // TODO: 현재 로그인된 보호소 관리자가 이 입양 후 건을 처리할 권한이 있는지 확인하는 로직 추가 필요

        if (currentStep.getStatus() != PostAdoptionStepStatus.SUBMITTED) {
            throw new IllegalStateException("Step is not in a submitted state. Current state: " + currentStep.getStatus());
        }

        if (isApproved) {
            approveStep(currentStep);
        } else {
            rejectStep(currentStep, rejectionReason);
        }
    }

    private void approveStep(PostAdoptionStepInstance currentStep) {
        currentStep.setStatus(PostAdoptionStepStatus.COMPLETED);
        currentStep.setCompletedAt(LocalDateTime.now());
        // TODO: Set approver from security context
        // currentStep.setApprover(loggedInUser);
        postAdoptionStepInstanceRepository.save(currentStep);

        // Find next step and activate it
        activateNextStep(currentStep);
    }

    private void rejectStep(PostAdoptionStepInstance step, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("반려 사유를 반드시 입력해야 합니다.");
        }
        step.setStatus(PostAdoptionStepStatus.REJECTED);
        step.setRejectionReason(reason);
        // TODO: Set approver from security context
        // step.setApprover(loggedInUser);
        postAdoptionStepInstanceRepository.save(step);
    }

    private void activateNextStep(PostAdoptionStepInstance currentStep) {
        PostAdoption postAdoption = currentStep.getPostAdoption();
        List<PostAdoptionStepInstance> allSteps = postAdoptionStepInstanceRepository.findByPostAdoptionIdOrderByStepOrderAsc(postAdoption.getId());

        // 현재 단계 다음의 단계를 찾음
        int currentIndex = allSteps.indexOf(currentStep);
        if (currentIndex > -1 && currentIndex < allSteps.size() - 1) {
            PostAdoptionStepInstance nextStep = allSteps.get(currentIndex + 1);
            if (nextStep.getStatus() == PostAdoptionStepStatus.NOT_STARTED) {
                nextStep.setStatus(PostAdoptionStepStatus.PENDING);
                postAdoptionStepInstanceRepository.save(nextStep);
            }
        } else {
            // 마지막 단계였을 경우, 전체 입양 후 프로세스를 완료 상태로 변경
            postAdoption.setProcessStatus(PostAdoptionProcessStatus.COMPLETED);
            postAdoptionRepository.save(postAdoption);
        }
    }

    /**
     * 보호소 관리자가 입양 후 프로세스를 수동으로 완료시킵니다.
     * @param postAdoptionId 완료할 입양 후 프로세스 ID
     */
    public void completePostAdoptionProcess(Long postAdoptionId) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        if (postAdoption.getProcessStatus() == PostAdoptionProcessStatus.COMPLETED || postAdoption.getProcessStatus() == PostAdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 후 프로세스입니다.");
        }

        // TODO: 현재 로그인된 보호소 관리자가 이 입양 후 건을 처리할 권한이 있는지 확인하는 로직 추가 필요

        postAdoption.setProcessStatus(PostAdoptionProcessStatus.COMPLETED);

        // 아직 완료되지 않은 모든 하위 단계들도 COMPLETED 처리
        postAdoption.getStepInstances().forEach(step -> {
            if (step.getStatus() != PostAdoptionStepStatus.COMPLETED) {
                step.setStatus(PostAdoptionStepStatus.COMPLETED);
                step.setCompletedAt(LocalDateTime.now());
            }
        });
        
        postAdoptionRepository.save(postAdoption);
    }

    /**
     * 입양 후 프로세스의 특정 단계에 대한 데이터를 제출합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepInstanceId 단계 인스턴스 ID
     * @param data 제출할 데이터 (임시)
     */
    public void submitPostAdoptionStep(Long postAdoptionId, Long stepInstanceId, String data) {
        PostAdoptionStepInstance step = postAdoptionStepInstanceRepository.findById(stepInstanceId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step instance not found with ID: " + stepInstanceId));

        if (!step.getPostAdoption().getId().equals(postAdoptionId)) {
            throw new IllegalArgumentException("Step instance does not belong to the specified post-adoption process.");
        }

        if (step.getStatus() != PostAdoptionStepStatus.PENDING &&
            step.getStatus() != PostAdoptionStepStatus.REJECTED) {
            throw new IllegalStateException("Step is not in PENDING or REJECTED state for submission. Current state: " + step.getStatus());
        }

        // TODO: 실제 데이터 저장 로직 구현 (현재는 임시로 data를 받음)
        // 예를 들어, 단계별로 별도의 엔티티를 만들고 여기에 데이터를 저장

        step.setStatus(PostAdoptionStepStatus.SUBMITTED);
        step.setSubmittedAt(LocalDateTime.now());
        postAdoptionStepInstanceRepository.save(step);
    }

    /**
     * 입양 후 프로세스의 특정 단계 상세 정보를 조회합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepInstanceId 단계 인스턴스 ID
     * @return PostAdoptionStepResponse DTO
     */
    @Transactional(readOnly = true)
    public PostAdoptionStepResponse getPostAdoptionStep(Long postAdoptionId, Long stepInstanceId) {
        PostAdoptionStepInstance step = postAdoptionStepInstanceRepository.findById(stepInstanceId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step instance not found with ID: " + stepInstanceId));

        if (!step.getPostAdoption().getId().equals(postAdoptionId)) {
            throw new IllegalArgumentException("Step instance does not belong to the specified post-adoption process.");
        }

        return mapToPostAdoptionStepResponse(step);
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
