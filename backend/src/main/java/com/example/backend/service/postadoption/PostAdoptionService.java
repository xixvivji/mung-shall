package com.example.backend.service.postadoption;

import com.example.backend.api.postadoption.dto.ChecklistItemResponse;
import com.example.backend.api.postadoption.dto.PostAdoptionStepCategory;
import com.example.backend.api.postadoption.dto.PostAdoptionStepDetailResponse;
import com.example.backend.api.postadoption.dto.SubmissionItemResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.postadoption.ChecklistItemInstance;
import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.postadoption.PostAdoptionStepDef;
import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.SubmissionInstance;
import com.example.backend.domain.postadoption.embed.ChecklistItemDef;
import com.example.backend.domain.postadoption.embed.SubmissionDef;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepTimeStatus;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.postadoption.ChecklistItemInstanceRepository;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepDefRepository;
import com.example.backend.repository.postadoption.PostAdoptionStepInstanceRepository;
import com.example.backend.repository.postadoption.SubmissionInstanceRepository;
import com.example.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostAdoptionService {

    private final PostAdoptionRepository postAdoptionRepository;
    private final PostAdoptionStepDefRepository postAdoptionStepDefRepository;
    private final PostAdoptionStepInstanceRepository postAdoptionStepInstanceRepository;
    private final AdoptionRepository adoptionRepository; // To link with the main adoption
    private final S3Service s3Service; // Inject S3Service
    private final ChecklistItemInstanceRepository checklistItemInstanceRepository; // Inject new repository
    private final SubmissionInstanceRepository submissionInstanceRepository; // Inject new repository

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
            
            PostAdoptionStepInstance stepInstance = new PostAdoptionStepInstance(
                    postAdoption,
                    stepDef.getName(),
                    stepDef.getDescription(),
                    stepDef.getDefaultOrder(),
                    stepDef,
                    dueDate
            );
            postAdoptionStepInstanceRepository.save(stepInstance); // Save stepInstance first to get its ID

            // Create and save checklist items
            List<ChecklistItemInstance> checklistInstances = stepDef.getChecklistDefs().stream()
                    .map(def -> new ChecklistItemInstance(stepInstance, def.getItemText(), false))
                    .collect(Collectors.toList());
            checklistItemInstanceRepository.saveAll(checklistInstances);
            stepInstance.getChecklistItems().addAll(checklistInstances); // Add to the step instance's list

            // Create and save submission items
            List<SubmissionInstance> submissionInstances = stepDef.getSubmissionDefs().stream()
                    .map(def -> new SubmissionInstance(stepInstance, def.getSubmissionName(), def.getDescription(), false, def.getType(), null, null))
                    .collect(Collectors.toList());
            submissionInstanceRepository.saveAll(submissionInstances);
            stepInstance.getSubmissionItems().addAll(submissionInstances); // Add to the step instance's list
        }

        return postAdoption;
    }

    /**
     * 특정 입양 후 프로세스를 조회합니다.
     * @param adoptionId 입양 ID
     * @return PostAdoption 엔티티
     */
    @Transactional(readOnly = true)
    public PostAdoption getPostAdoptionProcess(Long adoptionId) {
        return postAdoptionRepository.findByAdoptionId(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found for Adoption ID: " + adoptionId));
    }

    

    /**
     * 특정 입양 후 프로세스 단계의 상세 정보를 조회합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepOrder 조회할 단계 순서
     * @return PostAdoptionStepDetailResponse
     */
    @Transactional(readOnly = true)
    public PostAdoptionStepDetailResponse getPostAdoptionStepDetail(Long postAdoptionId, Integer stepOrder) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        PostAdoptionStepInstance stepInstance = (PostAdoptionStepInstance) postAdoptionStepInstanceRepository.findByPostAdoptionIdAndStepOrder(postAdoption.getId(), stepOrder)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step not found for postAdoptionId: " + postAdoption.getId() + " and stepOrder: " + stepOrder));

        PostAdoptionStepTimeStatus timeStatus = calculateTimeStatus(stepInstance.getDueDate());

        // Map checklist items
        List<ChecklistItemResponse> checklistResponses = stepInstance.getChecklistItems().stream()
                .map(itemInstance -> {
                    // Find the corresponding def to get 'required' status
                    ChecklistItemDef def = stepInstance.getPostAdoptionStepDef().getChecklistDefs().stream()
                            .filter(d -> d.getItemText().equals(itemInstance.getItemText()))
                            .findFirst()
                            .orElse(null); // Should not happen if data is consistent

                    return ChecklistItemResponse.builder()
                            .id(itemInstance.getId()) // Populate ID
                            .itemText(itemInstance.getItemText())
                            .checked(itemInstance.isChecked())
                            .required(def != null ? def.isRequired() : false)
                            // Categorization logic - this needs to be more sophisticated
                            .category(determineChecklistCategory(itemInstance.getItemText()))
                            .build();
                })
                .collect(Collectors.toList());

        // Map submission items
        List<SubmissionItemResponse> submissionResponses = stepInstance.getSubmissionItems().stream()
                .map(itemInstance -> {
                    // Find the corresponding def to get 'required' status
                    SubmissionDef def = stepInstance.getPostAdoptionStepDef().getSubmissionDefs().stream()
                            .filter(d -> d.getSubmissionName().equals(itemInstance.getSubmissionName()))
                            .findFirst()
                            .orElse(null); // Should not happen if data is consistent

                    return SubmissionItemResponse.builder()
                            .id(itemInstance.getId())
                            .submissionName(itemInstance.getSubmissionName())
                            .description(itemInstance.getDescription())
                            .submitted(itemInstance.isSubmitted())
                            .required(def != null ? def.isRequired() : false)
                            .type(itemInstance.getType())
                            .fileUrl(itemInstance.getFileUrl())
                            .originalFileName(itemInstance.getOriginalFileName())
                            // Categorization logic - this needs to be more sophisticated
                            .category(PostAdoptionStepCategory.REQUIRED_SUBMISSION) // Submissions are always REQUIRED_SUBMISSION
                            .build();
                })
                .collect(Collectors.toList());

        return PostAdoptionStepDetailResponse.builder()
                .id(stepInstance.getId())
                .postAdoptionId(postAdoption.getId())
                .stepName(stepInstance.getStepName())
                .description(stepInstance.getDescription())
                .stepOrder(stepInstance.getStepOrder())
                .dueDate(stepInstance.getDueDate())
                .timeStatus(timeStatus)
                .checklistItems(checklistResponses)
                .submissionItems(submissionResponses)
                .submittedAt(stepInstance.getSubmittedAt())
                .completedAt(stepInstance.getCompletedAt())
                .rejectionReason(stepInstance.getRejectionReason())
                .build();
    }

    private PostAdoptionStepTimeStatus calculateTimeStatus(LocalDate dueDate) {
        LocalDate today = LocalDate.now();
        if (dueDate.isBefore(today)) {
            return PostAdoptionStepTimeStatus.OVERDUE;
        } else if (dueDate.isEqual(today)) {
            return PostAdoptionStepTimeStatus.DUE_TODAY;
        } else {
            return PostAdoptionStepTimeStatus.UPCOMING;
        }
    }

    // This categorization logic needs to be refined based on actual item texts or a more robust definition
    private PostAdoptionStepCategory determineChecklistCategory(String itemText) {
        if (itemText.contains("예방접종") || itemText.contains("중성화") || itemText.contains("건강기록") || itemText.contains("의료")) {
            return PostAdoptionStepCategory.MEDICAL_INFO;
        }
        // Default or other categories
        return PostAdoptionStepCategory.ADOPTER_CHECKLIST;
    }

    /**
     * 입양 후 단계의 제출 항목 파일을 업로드하고 상태를 업데이트합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepOrder 단계 순서
     * @param submissionId 제출 항목 ID
     * @param file 업로드할 파일
     * @return 업데이트된 PostAdoptionStepInstance
     */
    @Transactional
    public PostAdoptionStepInstance uploadSubmissionFile(Long postAdoptionId, Integer stepOrder, Long submissionId, MultipartFile file) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        PostAdoptionStepInstance stepInstance = (PostAdoptionStepInstance) postAdoptionStepInstanceRepository.findByPostAdoptionIdAndStepOrder(postAdoption.getId(), stepOrder)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step not found for postAdoptionId: " + postAdoption.getId() + " and stepOrder: " + stepOrder));

        SubmissionInstance targetSubmission = submissionInstanceRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission item with ID '" + submissionId + "' not found."));

        if (!targetSubmission.getPostAdoptionStepInstance().getId().equals(stepInstance.getId())) {
            throw new IllegalArgumentException("Submission item with ID '" + submissionId + "' does not belong to step instance ID: " + stepInstance.getId());
        }

        if (file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 비어 있습니다.");
        }

        String fileUrl;
        try {
            fileUrl = s3Service.uploadFile(file, "post-adoption-submissions");
        } catch (IOException e) {
            throw new IllegalArgumentException("파일 업로드 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
        
        targetSubmission.setSubmitted(true);
        targetSubmission.setFileUrl(fileUrl);
        targetSubmission.setOriginalFileName(file.getOriginalFilename());

        return postAdoptionStepInstanceRepository.save(stepInstance);
    }

    /**
     * 입양 후 단계의 제출 항목 파일을 삭제하고 상태를 초기화합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepOrder 단계 순서
     * @param submissionId 제출 항목 ID
     * @return 업데이트된 PostAdoptionStepInstance
     */
    @Transactional
    public PostAdoptionStepInstance deleteSubmissionFile(Long postAdoptionId, Integer stepOrder, Long submissionId) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        PostAdoptionStepInstance stepInstance = (PostAdoptionStepInstance) postAdoptionStepInstanceRepository.findByPostAdoptionIdAndStepOrder(postAdoption.getId(), stepOrder)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step not found for postAdoptionId: " + postAdoption.getId() + " and stepOrder: " + stepOrder));

        SubmissionInstance targetSubmission = submissionInstanceRepository.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Submission item with ID '" + submissionId + "' not found."));

        if (!targetSubmission.getPostAdoptionStepInstance().getId().equals(stepInstance.getId())) {
            throw new IllegalArgumentException("Submission item with ID '" + submissionId + "' does not belong to step instance ID: " + stepInstance.getId());
        }

        if (targetSubmission.getFileUrl() != null && !targetSubmission.getFileUrl().isEmpty()) {
            s3Service.deleteFile(targetSubmission.getFileUrl());
        }
        
        targetSubmission.setSubmitted(false);
        targetSubmission.setFileUrl(null);
        targetSubmission.setOriginalFileName(null);

        return postAdoptionStepInstanceRepository.save(stepInstance);
    }

    /**
     * 입양 후 단계의 체크리스트 항목 상태를 업데이트합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @param stepOrder 단계 순서
     * @param checklistItemId 체크리스트 항목 ID
     * @param checked 체크 여부
     * @return 업데이트된 PostAdoptionStepInstance
     */
    @Transactional
    public PostAdoptionStepInstance updateChecklistItemStatus(Long postAdoptionId, Integer stepOrder, Long checklistItemId, boolean checked) {
        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));

        PostAdoptionStepInstance stepInstance = (PostAdoptionStepInstance) postAdoptionStepInstanceRepository.findByPostAdoptionIdAndStepOrder(postAdoption.getId(), stepOrder)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption step not found for postAdoptionId: " + postAdoption.getId() + " and stepOrder: " + stepOrder));

        ChecklistItemInstance targetChecklistItem = checklistItemInstanceRepository.findById(checklistItemId)
                .orElseThrow(() -> new IllegalArgumentException("Checklist item with ID '" + checklistItemId + "' not found."));

        if (!targetChecklistItem.getPostAdoptionStepInstance().getId().equals(stepInstance.getId())) {
            throw new IllegalArgumentException("Checklist item with ID '" + checklistItemId + "' does not belong to step instance ID: " + stepInstance.getId());
        }

        targetChecklistItem.setChecked(checked);

        return postAdoptionStepInstanceRepository.save(stepInstance);
    }
}
