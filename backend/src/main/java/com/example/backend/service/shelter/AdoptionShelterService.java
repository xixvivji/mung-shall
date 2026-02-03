package com.example.backend.service.shelter;

import com.example.backend.api.adoption.dto.AdoptionDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionStepDefResponse;
import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse;
import com.example.backend.api.adoption.dto.shelter.ShelterAdoptionUserResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionShelterService {

    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionRepository adoptionRepository;
    private final ShelterRepository shelterRepository;
    private final AbandonedDogRepository abandonedDogRepository;
    private final ShelterPermissionEvaluator shelterPermissionEvaluator;

    /**
     * 보호소 사용자를 위한 입양 신청자 목록을 조회합니다.
     * 특정 보호소 소속의 강아지들에 대한 입양 신청자 정보를 반환합니다.
     *
     * @param shelterId 보호소 사용자 ID
     * @param status        조회할 입양 진행 상태 (IN_PROGRESS 또는 COMPLETED)
     * @return ShelterAdoptionUserResponse 리스트
     */
    @Transactional(readOnly = true)
    public List<ShelterAdoptionUserResponse> getAdoptersForShelterDogs(Long shelterId, AdoptionProcessStatus status) {
        Shelter shelter = shelterRepository.findById(shelterId)
                .orElseThrow(() -> new IllegalArgumentException("ID에 해당하는 보호소가 없습니다: " + shelterId));

        String careRegNo = shelter.getShelterRegNo();
        List<AbandonedDog> shelterDogs = abandonedDogRepository.findByCareRegNo(careRegNo);

        return shelterDogs.stream()
                .flatMap(dog -> adoptionRepository.findByAbandonedDogAndProcessStatus(dog, status).stream())
                .map(adoption -> ShelterAdoptionUserResponse.builder()
                        .adoptionId(adoption.getId())
                        .userId(adoption.getUser().getUserId())
                        .userName(adoption.getUser().getName())
                        .userEmail(adoption.getUser().getEmail())
                        .userPhone(adoption.getUser().getPhone())
                        .abandonedDogId(adoption.getAbandonedDog().getId())
                        .abandonedDogKindNm(adoption.getAbandonedDog().getKindNm())
                        .abandonedDogDesertionNo(adoption.getAbandonedDog().getDesertionNo())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 보호소 사용자를 위한 특정 입양 상세 정보를 조회합니다.
     * 요청한 입양 ID가 해당 보호소 소속의 강아지에 대한 것인지 검증합니다.
     *
     * @param shelterId 보호소 사용자 ID
     * @param adoptionId    조회할 입양 프로세스 ID
     * @return 입양 상세 정보 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionDetailResponse getShelterAdoptionDetail(Long shelterId, Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 입양이 없습니다: " + adoptionId));

        // 입양의 보호소 유저가 현재 요청한 보호소 유저와 일치하는지 확인
        shelterPermissionEvaluator.checkShelterPermission(adoption.getAbandonedDog());

        List<AdoptionStepInstanceResponse> stepResponses = adoption.getSteps().stream()
                .map(stepInstance -> AdoptionStepInstanceResponse.builder()
                        .id(stepInstance.getId())
                        .stepDef(AdoptionStepDefResponse.builder()
                                .id(stepInstance.getStepDef().getId())
                                .stepOrder(stepInstance.getStepDef().getStepOrder())
                                .stepName(stepInstance.getStepDef().getStepName())
                                .description(stepInstance.getStepDef().getDescription())
                                .build())
                        .status(stepInstance.getStatus())
                        .submittedAt(stepInstance.getSubmittedAt())
                        .approvedAt(stepInstance.getApprovedAt())
                        .completedAt(stepInstance.getCompletedAt())
                        .rejectionReason(stepInstance.getRejectionReason())
                        .build())
                .collect(Collectors.toList());

        // 입양 instance 정보도 같이 제공
        return AdoptionDetailResponse.builder()
                .id(adoption.getId())
                .userId(adoption.getUser().getUserId())
                .userName(adoption.getUser().getName())
                .dogId(adoption.getAbandonedDog().getId())
                .processStatus(adoption.getProcessStatus())
                .status(adoption.getStatus())
                .rejectionReason(adoption.getRejectionReason())
// 임시                .steps(stepResponses)
                .build();
    }

    /**
     * 보호소 관리자가 입양 단계를 승인하거나 반려합니다.
     * @param stepInstanceId 처리할 단계 인스턴스 ID
     * @param isApproved 승인 여부
     * @param rejectionReason 반려 시 사유
     */
    public void verifyAdoptionStep(Long stepInstanceId, boolean isApproved, String rejectionReason) {
        AdoptionStepInstance currentStep = adoptionStepInstanceRepository.findById(stepInstanceId)
                .orElseThrow(() -> new IllegalArgumentException("ID에 해당하는 stepInstance가 존재하지 않습니다: " + stepInstanceId));

        // 현재 로그인된 보호소 관리자가 이 입양 건을 처리할 권한이 있는지 확인
        shelterPermissionEvaluator.checkShelterPermission(currentStep.getAdoption().getAbandonedDog());

        if (currentStep.getStatus() != AdoptionStepStatus.SUBMITTED) {
            throw new IllegalStateException("stepInstance가 SUBMITTED 상태가 아닙니다: " + currentStep.getStatus());
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
        adoptionStepInstanceRepository.save(currentStep);

        activateNextStep(currentStep);
    }

    private void rejectStep(AdoptionStepInstance step, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("반려 사유를 반드시 입력해야 합니다.");
        }
        step.setStatus(AdoptionStepStatus.REJECTED);
        step.setRejectionReason(reason);
        adoptionStepInstanceRepository.save(step);
    }

    private void activateNextStep(AdoptionStepInstance currentStep) {
        Adoption adoption = currentStep.getAdoption();
        List<AdoptionStepInstance> allSteps = adoptionStepInstanceRepository.findByAdoptionIdOrderByStepDefStepOrderAsc(adoption.getId());

        int currentIndex = allSteps.indexOf(currentStep);
        if (currentIndex < 0 || currentIndex == allSteps.size() - 1) {
            // 마지막 단계가 승인되었거나, 더 이상 진행할 단계가 없음
            // 이 경우 전체 입양 프로세스의 상태는 verifyAdoptionProcess에서 별도로 관리하므로 여기서는 개별 step만 처리
            return;
        }

        AdoptionStepInstance nextStep = allSteps.get(currentIndex + 1);
        if (nextStep.getStatus() == AdoptionStepStatus.NOT_STARTED) {
            nextStep.setStatus(AdoptionStepStatus.PENDING);
            adoptionStepInstanceRepository.save(nextStep);
        }
    }

    /**
     * 보호소 관리자가 입양 프로세스를 최종 승인하거나 반려합니다.
     * @param adoptionId 처리할 입양 프로세스 ID
     * @param isApproved 승인 여부
     * @param rejectionReason 반려 시 사유
     */
    public void verifyAdoptionProcess(Long adoptionId, boolean isApproved, String rejectionReason) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        if (adoption.getProcessStatus() == AdoptionProcessStatus.COMPLETED || adoption.getProcessStatus() == AdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 프로세스입니다.");
        }

        // 현재 로그인된 보호소 관리자가 이 입양 건을 처리할 권한이 있는지 확인
        shelterPermissionEvaluator.checkShelterPermission(adoption.getAbandonedDog());

        if (isApproved) {
            // 모든 단계가 정확히 APPROVED 상태인지 확인해야 최종 승인 가능
            boolean allStepsApproved = adoption.getSteps().stream()
                    .allMatch(step -> step.getStatus() == AdoptionStepStatus.APPROVED);

            if (!allStepsApproved) {
                throw new IllegalStateException("모든 입양 단계가 승인(APPROVED) 상태여야 최종 완료할 수 있습니다.");
            }
            approveAdoption(adoption);
        } else {
            rejectAdoption(adoption, rejectionReason);
        }
    }

    private void approveAdoption(Adoption adoption) {
        // 모든 APPROVED 상태의 단계들을 COMPLETED 처리
        adoption.getSteps().forEach(step -> {
            if (step.getStatus() == AdoptionStepStatus.APPROVED) {
                step.setStatus(AdoptionStepStatus.COMPLETED);
                step.setCompletedAt(LocalDateTime.now());
                adoptionStepInstanceRepository.save(step);
            }
        });

        adoption.setProcessStatus(AdoptionProcessStatus.COMPLETED);
        adoption.setStatus(AdoptionStatus.APPROVED);
        adoptionRepository.save(adoption);
    }

    private void rejectAdoption(Adoption adoption, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new IllegalArgumentException("반려 사유를 반드시 입력해야 합니다.");
        }
        adoption.setProcessStatus(AdoptionProcessStatus.COMPLETED); // 반려도 절차는 완료된 것
        adoption.setStatus(AdoptionStatus.REJECTED);
        adoption.setRejectionReason(reason);
        adoptionRepository.save(adoption);
    }
}