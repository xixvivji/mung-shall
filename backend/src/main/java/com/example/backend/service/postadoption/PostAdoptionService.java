package com.example.backend.service.postadoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.postadoption.PostAdoptionStepDef;
import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.enums.PostAdoptionProcessStatus;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepStatus;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepDefRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostAdoptionService {

    private final PostAdoptionRepository postAdoptionRepository;
    private final PostAdoptionStepDefRepository postAdoptionStepDefRepository;
    private final PostAdoptionStepInstanceRepository postAdoptionStepInstanceRepository;
    private final AdoptionRepository adoptionRepository; // To link with the main adoption

    /**
     * 입양 완료 시 입양 후 프로세스를 시작합니다.
     * @param adoptionId 완료된 입양 ID
     * @return 생성된 PostAdoption 엔티티
     */
    public PostAdoption startPostAdoptionProcess(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        if (postAdoptionRepository.findByAdoptionId(adoptionId).isPresent()) {
            throw new IllegalStateException("Post-adoption process already exists for Adoption ID: " + adoptionId);
        }

        PostAdoption postAdoption = new PostAdoption(adoption);
        postAdoptionRepository.save(postAdoption);

        // 모든 PostAdoptionStepDef를 가져와 PostAdoptionStepInstance 생성
        List<PostAdoptionStepDef> stepDefs = postAdoptionStepDefRepository.findAllByOrderByDefaultOrderAsc();
        if (stepDefs.isEmpty()) {
            throw new IllegalStateException("입양 후 단계 정의(PostAdoptionStepDef)가 설정되어 있지 않습니다.");
        }

        for (PostAdoptionStepDef stepDef : stepDefs) {
            PostAdoptionStepInstance stepInstance = new PostAdoptionStepInstance(
                    postAdoption,
                    stepDef.getName(),
                    stepDef.getDescription(),
                    stepDef.getDefaultOrder(),
                    PostAdoptionStepStatus.NOT_STARTED,
                    stepDef
            );
            postAdoptionStepInstanceRepository.save(stepInstance);
        }

        // 첫 번째 단계 활성화 (PENDING 상태로)
        postAdoptionStepInstanceRepository.findByPostAdoptionIdOrderByStepOrderAsc(postAdoption.getId())
                .stream().findFirst().ifPresent(firstStep -> {
                    firstStep.setStatus(PostAdoptionStepStatus.PENDING);
                    postAdoptionStepInstanceRepository.save(firstStep);
                });

        return postAdoption;
    }

    /**
     * 특정 입양 후 프로세스를 조회합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @return PostAdoption 엔티티
     */
    @Transactional(readOnly = true)
    public PostAdoption getPostAdoptionProcess(Long postAdoptionId) {
        return postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));
    }

    /**
     * 입양 후 프로세스를 취소합니다.
     * @param postAdoptionId 취소할 입양 후 프로세스 ID
     */
    public void cancelPostAdoptionProcess(Long postAdoptionId) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        if (postAdoption.getProcessStatus() == PostAdoptionProcessStatus.COMPLETED ||
                postAdoption.getProcessStatus() == PostAdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 후 프로세스는 취소할 수 없습니다.");
        }

        postAdoption.setProcessStatus(PostAdoptionProcessStatus.CANCELLED);
        postAdoptionRepository.save(postAdoption);

        // 모든 단계 인스턴스 상태도 CANCELLED로 변경
        postAdoptionStepInstanceRepository.findByPostAdoptionIdOrderByStepOrderAsc(postAdoptionId)
                .forEach(step -> {
                    if (step.getStatus() != PostAdoptionStepStatus.COMPLETED) {
                        step.setStatus(PostAdoptionStepStatus.CANCELLED);
                        postAdoptionStepInstanceRepository.save(step);
                    }
                });
    }
}
