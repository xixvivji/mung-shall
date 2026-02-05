package com.example.backend.service.postadoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.postadoption.PostAdoptionStepDef;
import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.embed.ChecklistItemDef;
import com.example.backend.domain.postadoption.embed.ChecklistItemInstance;
import com.example.backend.domain.postadoption.embed.SubmissionDef;
import com.example.backend.domain.postadoption.embed.SubmissionInstance;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepStatus;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepDefRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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

        // Get the completedAt date from the Adoption.
        // Assuming Adoption has a getCompletedAt() method that returns LocalDateTime.
        LocalDate adoptionCompletedDate = adoption.getCompletedAt().toLocalDate();

        for (PostAdoptionStepDef stepDef : stepDefs) {
            LocalDate dueDate = adoptionCompletedDate.plusDays(stepDef.getDaysAfterAdoption());
            List<ChecklistItemInstance> checklistInstances = createChecklistInstances(stepDef.getChecklistDefs());
            List<SubmissionInstance> submissionInstances = createSubmissionInstances(stepDef.getSubmissionDefs());

            PostAdoptionStepInstance stepInstance = new PostAdoptionStepInstance(
                    postAdoption,
                    stepDef.getName(),
                    stepDef.getDescription(),
                    stepDef.getDefaultOrder(),
                    PostAdoptionStepStatus.NOT_STARTED,
                    stepDef,
                    dueDate,
                    checklistInstances,
                    submissionInstances
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

    private List<ChecklistItemInstance> createChecklistInstances(List<ChecklistItemDef> defs) {
        return defs.stream()
                .map(def -> new ChecklistItemInstance(def.getItemText(), false)) // Initially unchecked
                .collect(Collectors.toList());
    }

    private List<SubmissionInstance> createSubmissionInstances(List<SubmissionDef> defs) {
        return defs.stream()
                .map(def -> new SubmissionInstance(def.getSubmissionName(), def.getDescription(), false, def.getType(), null, null)) // Initially not submitted
                .collect(Collectors.toList());
    }
}
