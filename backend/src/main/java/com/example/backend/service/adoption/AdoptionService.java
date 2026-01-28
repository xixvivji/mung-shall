package com.example.backend.service.adoption;

import com.example.backend.api.adoption.dto.AdoptionDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionStepDefResponse;
import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.AdoptionStepDef;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.repository.AbandonedDogRepository;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.step.AdoptionStepDefRepository;
import com.example.backend.repository.adoption.step.AdoptionStepInstanceRepository;
import com.example.backend.domain.user.UserType;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepDefRepository adoptionStepDefRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final UserRepository userRepository;
    private final AbandonedDogRepository abandonedDogRepository;


    /**
     * 초기 입양 프로세스를 생성합니다.
     * 사용자가 '입양하기' 버튼을 눌렀을 때 호출됩니다.
     * Adoption 엔티티와 모든 AdoptionStepInstance를 생성하고 첫 단계를 활성화합니다.
     *
     * @param userId          입양 신청 사용자 ID
     * @param abandonedDogId  입양 대상 유기견 ID
     * @return 생성된 Adoption의 ID
     */
    public Long createAdoptionProcess(Long userId, Long abandonedDogId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 유저가 없습니다: " + userId));
        AbandonedDog dog = abandonedDogRepository.findById(abandonedDogId)
                .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 강아지가 없습니다: " + abandonedDogId));

        // 이미 해당 강아지에 대해 진행중인 입양 절차가 있는지 확인
        if (adoptionRepository.findByAbandonedDogAndProcessStatus(dog, AdoptionProcessStatus.IN_PROGRESS).isPresent()) {
            throw new IllegalArgumentException("이미 해당 유기견에 대한 입양 절차가 진행 중입니다.");
        }

        // 해당 유기견의 보호소 정보로 보호소 유저를 찾아서 설정
        User shelterUser = userRepository.findByUserTypeAndShelterRegNo(UserType.shelter, dog.getCareRegNo())
                .orElseThrow(() -> new IllegalStateException("해당 유기견의 보호소 정보와 일치하는 보호소 유저를 찾을 수 없습니다. (등록번호: " + dog.getCareRegNo() + ")"));

        // 입양 정보 생성
        Adoption adoption = new Adoption();
        adoption.setUser(user);
        adoption.setAbandonedDog(dog);
        adoption.setShelter(shelterUser);
        adoption.setProcessStatus(AdoptionProcessStatus.IN_PROGRESS);
        adoptionRepository.save(adoption);

        // 모든 StepDef를 가져와 StepInstance 생성
        List<AdoptionStepDef> stepDefs = adoptionStepDefRepository.findAllByOrderByStepOrderAsc();
        if (stepDefs.isEmpty()) {
            throw new IllegalStateException("입양 단계 정의(AdoptionStepDef)가 설정되어 있지 않습니다.");
        }

        AdoptionStepInstance firstStepInstance = null;
        for (AdoptionStepDef stepDef : stepDefs) {
            AdoptionStepInstance stepInstance = new AdoptionStepInstance();
            stepInstance.setAdoption(adoption);
            stepInstance.setStepDef(stepDef);
            stepInstance.setStatus(AdoptionStepStatus.NOT_STARTED);

            // 첫 번째 단계 활성화
            if (stepDef.getStepOrder() == 1) {
                stepInstance.setStatus(AdoptionStepStatus.PENDING);
                firstStepInstance = stepInstance;
            }
            adoption.addStep(stepInstance); // Adoption 엔티티의 addStep 헬퍼 메서드 사용
        }
        adoptionRepository.save(adoption); // cascade 때문에 모든 stepInstances가 함께 저장됨

        if (firstStepInstance == null) {
            throw new IllegalStateException("첫 번째 입양 단계 인스턴스를 찾을 수 없습니다.");
        }

        return adoption.getId();
    }

    /**
     * 입양 프로세스를 취소합니다.
     *
     * @param adoptionId 취소할 입양 프로세스 ID
     */
    public void cancelAdoptionProcess(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        if (adoption.getProcessStatus() == AdoptionProcessStatus.COMPLETED ||
                adoption.getProcessStatus() == AdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 프로세스는 취소할 수 없습니다.");
        }

        adoption.setProcessStatus(AdoptionProcessStatus.CANCELLED);
        adoptionRepository.save(adoption);

//        // 모든 단계 인스턴스 상태도 CANCELLED로 변경
//        List<AdoptionStepInstance> stepInstances = adoptionStepInstanceRepository.findByAdoptionIdOrderByStepDefStepOrderAsc(adoptionId);
//        for (AdoptionStepInstance stepInstance : stepInstances) {
//            if (stepInstance.getStatus() != AdoptionStepStatus.COMPLETED) { // 완료된 단계는 유지
//                stepInstance.setStatus(AdoptionStepStatus.CANCELLED);
//                adoptionStepInstanceRepository.save(stepInstance);
//            }
//        }
    }

        /**
         * 입양 상세 정보를 조회합니다.
         *
         * @param adoptionId 조회할 입양 프로세스 ID
         * @return 입양 상세 정보 DTO
         */
        public AdoptionDetailResponse getAdoptionDetail(Long adoptionId) {
            Adoption adoption = adoptionRepository.findById(adoptionId)
                    .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 입양이 없습니다: " + adoptionId));

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
                            .approverUserId(stepInstance.getApprover() != null ? stepInstance.getApprover().getUserId() : null)
                            .approverUserName(stepInstance.getApprover() != null ? stepInstance.getApprover().getName() : null)
                            .submittedAt(stepInstance.getSubmittedAt())
                            .approvedAt(stepInstance.getApprovedAt())
                            .completedAt(stepInstance.getCompletedAt())
                            .rejectionReason(stepInstance.getRejectionReason())
                            .build())
                    .collect(Collectors.toList());
    

            return AdoptionDetailResponse.builder()
                    .id(adoption.getId())
                    .userId(adoption.getUser().getUserId())
                    .userName(adoption.getUser().getName())
                    .dogId(adoption.getAbandonedDog().getId())
                    .processStatus(adoption.getProcessStatus())
                    .steps(stepResponses)
                    .build();
        }

        /**
         * 특정 입양의 상담(Step 3) 단계 정보를 조회합니다.
         *
         * @param adoptionId 조회할 입양 프로세스 ID
         * @return 상담 단계의 상세 정보 DTO
         */
        @Transactional(readOnly = true)

        public AdoptionStepInstanceResponse getAdoptionCounselingStep(Long adoptionId) {

            Adoption adoption = adoptionRepository.findById(adoptionId)
                    .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 입양이 없습니다: " + adoptionId));

            AdoptionStepInstance counselingStep = adoption.getSteps().stream()
                    .filter(step -> step.getStepDef().getStepOrder() == 3) // Filter for counseling step (Step 3)
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("상담 단계 (Step 3)를 찾을 수 없습니다."));

            return AdoptionStepInstanceResponse.builder()
                    .id(counselingStep.getId())
                    .stepDef(AdoptionStepDefResponse.builder()
                            .id(counselingStep.getStepDef().getId())
                            .stepOrder(counselingStep.getStepDef().getStepOrder())
                            .stepName(counselingStep.getStepDef().getStepName())
                            .description(counselingStep.getStepDef().getDescription())
                            .build())
                    .status(counselingStep.getStatus())
                    .approverUserId(counselingStep.getApprover() != null ? counselingStep.getApprover().getUserId() : null)
                    .approverUserName(counselingStep.getApprover() != null ? counselingStep.getApprover().getName() : null)
                    .submittedAt(counselingStep.getSubmittedAt())
                    .approvedAt(counselingStep.getApprovedAt())
                    .completedAt(counselingStep.getCompletedAt())
                    .rejectionReason(counselingStep.getRejectionReason())
                    .build();
        }
    }

    