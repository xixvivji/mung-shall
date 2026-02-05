package com.example.backend.api.postadoption.dto;

import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepTimeStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class PostAdoptionStepDetailResponse {
    private Long id;
    private Long postAdoptionId;
    private String stepName;
    private String description;
    private Integer stepOrder;
    private LocalDate dueDate;
    private PostAdoptionStepTimeStatus timeStatus;
    private LocalDateTime adoptionCompletedAt;

    private List<ChecklistItemResponse> checklistItems;
    private List<SubmissionItemResponse> submissionItems;

    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;

    public static PostAdoptionStepDetailResponse fromEntity(PostAdoptionStepInstance stepInstance, PostAdoptionStepTimeStatus timeStatus) {
        return PostAdoptionStepDetailResponse.builder()
                .id(stepInstance.getId())
                .postAdoptionId(stepInstance.getPostAdoption().getId())
                .stepName(stepInstance.getStepName())
                .description(stepInstance.getDescription())
                .stepOrder(stepInstance.getStepOrder())
                .dueDate(stepInstance.getDueDate())
                .timeStatus(timeStatus)
                .adoptionCompletedAt(stepInstance.getPostAdoption().getAdoption().getCompletedAt()) // Populated
                .checklistItems(stepInstance.getChecklistItems().stream()
                        .map(item -> ChecklistItemResponse.builder()
                                .itemText(item.getItemText())
                                .checked(item.isChecked())
                                .build())
                        .collect(Collectors.toList()))
                .submissionItems(stepInstance.getSubmissionItems().stream()
                        .map(item -> SubmissionItemResponse.builder()
                                .submissionName(item.getSubmissionName())
                                .description(item.getDescription())
                                .submitted(item.isSubmitted())
                                .type(item.getType())
                                .fileUrl(item.getFileUrl())
                                .originalFileName(item.getOriginalFileName())
                                .build())
                        .collect(Collectors.toList()))
                .submittedAt(stepInstance.getSubmittedAt())
                .completedAt(stepInstance.getCompletedAt())
                .rejectionReason(stepInstance.getRejectionReason())
                .build();
    }
}
