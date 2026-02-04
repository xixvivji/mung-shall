package com.example.backend.service.adoption;

import com.example.backend.api.adoption.dto.AdoptionDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionStepDefResponse;
import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse;
import com.example.backend.api.adoption.dto.AdoptionStatusResponse;
import com.example.backend.api.adoption.dto.AdoptionStepSummaryResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.AdoptionStepDef;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepDefRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.adoption.survey.AdoptionSurveyRepository;
import com.example.backend.repository.dog.interest.UserDogInterestRepository; // Added
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
    private final AdoptionSurveyRepository adoptionSurveyRepository;
    private final UserRepository userRepository;
    private final AbandonedDogRepository abandonedDogRepository;
    private final UserDogInterestRepository userDogInterestRepository;


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

        // 강아지가 좋아요 표시되어 있는지 확인하고, 좋아요가 있다면 취소
        userDogInterestRepository.findByUserAndAbandonedDog(user, dog).ifPresent(userDogInterestRepository::delete);

        // 입양 정보 생성
        Adoption adoption = new Adoption();
        adoption.setUser(user);
        adoption.setAbandonedDog(dog);
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
            adoption.addStep(stepInstance);
        }
        adoptionRepository.save(adoption); // cascade 때문에 모든 stepInstances가 함께 저장됨

        if (firstStepInstance == null) {
            throw new IllegalStateException("첫 번째 입양 단계 인스턴스를 찾을 수 없습니다.");
        }

        return adoption.getId();
    }

    // 흠 로직 확인해봐야..
    /**
     * 입양 프로세스를 삭제합니다.
     *
     * @param adoptionId 삭제할 입양 프로세스 ID
     */
    public void deleteAdoptionProcess(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("ID에 해당하는 입양을 찾을 수 없습니다: " + adoptionId));

        // 완료된 입양 프로세스는 삭제 불가
        if (adoption.getProcessStatus() == AdoptionProcessStatus.COMPLETED) {
            throw new IllegalStateException("완료된 입양 프로세스는 삭제할 수 없습니다.");
        }

        // AdoptionStepInstance에 연결된 AdoptionSurvey 먼저 삭제
        adoption.getSteps().forEach(stepInstance ->
                adoptionSurveyRepository.findById(stepInstance.getId()).ifPresent(adoptionSurveyRepository::delete)
        );

        adoptionRepository.delete(adoption);
    }

    /**
     * 입양 스텝별 상태 정보를 조회합니다.
     *
     * @param adoptionId 조회할 입양 프로세스 ID
     * @return 입양 상세 정보 DTO
     */
    public AdoptionDetailResponse getAdoptionDetail(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 입양이 없습니다: " + adoptionId));

        // 요청 사용자 ID와 Adoption의 userId가 일치하는지 확인 or 담당 shelter

        List<AdoptionStepSummaryResponse> stepResponses = adoption.getSteps().stream()
                .map(stepInstance -> AdoptionStepSummaryResponse.builder()
                        .id(stepInstance.getId())
                        .status(stepInstance.getStatus())
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
     * 특정 입양 프로세스의 특정 단계(stepOrder)에 대한 상세 정보를 조회합니다.
     *
     * @param adoptionId 조회할 입양 프로세스 ID
     * @param stepOrder  조회할 입양 단계의 순서 (예: 1, 2, 3...)
     * @return 입양 단계 인스턴스 상세 정보 DTO
     */
    public AdoptionStepInstanceResponse getAdoptionStepInstanceDetail(Long adoptionId, Integer stepOrder) {
        AdoptionStepInstance stepInstance = adoptionStepInstanceRepository.findByAdoptionIdAndStepDefStepOrder(adoptionId, stepOrder)
                .orElseThrow(() -> new IllegalArgumentException("해당 입양 프로세스 ID와 단계 순서에 맞는 입양 단계를 찾을 수 없습니다: adoptionId=" + adoptionId + ", stepOrder=" + stepOrder));

        // 요청 사용자 ID와 Adoption의 userId가 일치하는지 확인 or 담당 shelter

        return AdoptionStepInstanceResponse.builder()
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
                .build();
    }

    /**
     * 특정 사용자의 특정 상태에 해당하는 입양 프로세스 목록을 조회합니다.
     *
     * @param userId 조회할 사용자 ID
     * @param status 조회할 입양 프로세스 상태 (IN_PROGRESS, COMPLETED 등)
     * @return 입양 상세 정보 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<AdoptionStatusResponse> getAdoptionsByUserIdAndStatus(Long userId, AdoptionProcessStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("ID와 일치하는 유저가 없습니다: " + userId));

        List<Adoption> adoptions = adoptionRepository.findByUserAndProcessStatus(user, status);

        return adoptions.stream()
                .map(adoption -> AdoptionStatusResponse.builder()
                        .userId(adoption.getUser().getUserId())
                        .dogId(adoption.getAbandonedDog().getId())
                        .adoptionId(adoption.getId())
                        .imageUrl(adoption.getAbandonedDog().getPopfile1())
                        .kindNm(adoption.getAbandonedDog().getKindCd())
                        .age(adoption.getAbandonedDog().getAge())
                        .weight(adoption.getAbandonedDog().getWeight())
                        .careNm(adoption.getAbandonedDog().getCareNm())
                        .processStatus(adoption.getProcessStatus())
                        .build())
                .collect(Collectors.toList());
    }
}