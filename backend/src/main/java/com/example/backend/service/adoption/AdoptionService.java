package com.example.backend.service.adoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.AdoptionStepDef;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.repository.AbandonedDogRepository;
import com.example.backend.repository.AdoptionRepository;
import com.example.backend.repository.adoption.step.AdoptionStepDefRepository;
import com.example.backend.repository.adoption.step.AdoptionStepInstanceRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.adoption.AdoptionApplicationService;
import com.example.backend.service.adoption.AdoptionDocumentService;
import com.example.backend.service.adoption.AdoptionEducationCertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepDefRepository adoptionStepDefRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final UserRepository userRepository;
    private final AbandonedDogRepository abandonedDogRepository;

    // Inject new specialized services
    private final AdoptionApplicationService adoptionApplicationService;
    private final AdoptionEducationCertService adoptionEducationCertService;
    private final AdoptionDocumentService adoptionDocumentService;

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
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        AbandonedDog dog = abandonedDogRepository.findById(abandonedDogId)
                .orElseThrow(() -> new IllegalArgumentException("AbandonedDog not found with ID: " + abandonedDogId));

        // 이미 해당 유저-강아지 조합으로 입양 신청이 있는지 확인
        if (adoptionRepository.findByUserUserIdAndAbandonedDogId(userId, abandonedDogId).isPresent()) {
            throw new IllegalArgumentException("이미 해당 유기견에 대한 입양 신청 프로세스가 존재합니다.");
        }

        Adoption adoption = new Adoption();
        adoption.setUser(user);
        adoption.setAbandonedDog(dog);
        adoption.setProcessStatus(AdoptionProcessStatus.PENDING); // 초기 상태는 PENDING
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
                stepInstance.setStatus(AdoptionStepStatus.PENDING); // 첫 단계는 PENDING 상태로 시작하여 제출 대기
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

        // 모든 단계 인스턴스 상태도 CANCELLED로 변경
        List<AdoptionStepInstance> stepInstances = adoptionStepInstanceRepository.findByAdoptionIdOrderByStepDefStepOrderAsc(adoptionId);
        for (AdoptionStepInstance stepInstance : stepInstances) {
            if (stepInstance.getStatus() != AdoptionStepStatus.COMPLETED) { // 완료된 단계는 유지
                stepInstance.setStatus(AdoptionStepStatus.CANCELLED);
                adoptionStepInstanceRepository.save(stepInstance);
            }
        }
    }
}
