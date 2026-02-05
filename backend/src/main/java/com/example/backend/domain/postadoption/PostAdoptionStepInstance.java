package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.embed.ChecklistItemInstance;
import com.example.backend.domain.postadoption.embed.SubmissionInstance;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepStatus;
import com.example.backend.domain.postadoption.enums.PostAdoptionStepTimeStatus; // Added
import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate; // Added
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post_adoption_step_instance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_adoption_id", "step_order"})
})
@Getter
@Setter
@NoArgsConstructor
public class PostAdoptionStepInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_adoption_id", nullable = false)
    private PostAdoption postAdoption;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostAdoptionStepStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_adoption_step_def_id") // Optional, for standard steps
    private PostAdoptionStepDef postAdoptionStepDef;

    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id") // Optional, only set when approved/rejected
    private User approver;

    @Column(nullable = false)
    private LocalDate dueDate; // 이 단계의 완료 예정일

    @Enumerated(EnumType.STRING)
    @Transient // DB에 저장하지 않고 런타임에 계산
    private PostAdoptionStepTimeStatus timeStatus;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_adoption_checklist_instance", joinColumns = @JoinColumn(name = "step_instance_id"))
    private List<ChecklistItemInstance> checklistItems = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_adoption_submission_instance", joinColumns = @JoinColumn(name = "step_instance_id"))
    private List<SubmissionInstance> submissionItems = new ArrayList<>();

    public PostAdoptionStepInstance(PostAdoption postAdoption, String stepName, String description, Integer stepOrder, PostAdoptionStepStatus status, PostAdoptionStepDef postAdoptionStepDef, LocalDate dueDate, List<ChecklistItemInstance> checklistItems, List<SubmissionInstance> submissionItems) {
        this.postAdoption = postAdoption;
        this.stepName = stepName;
        this.description = description;
        this.stepOrder = stepOrder;
        this.status = status;
        this.postAdoptionStepDef = postAdoptionStepDef;
        this.dueDate = dueDate;
        this.checklistItems = checklistItems;
        this.submissionItems = submissionItems;
    }
}
