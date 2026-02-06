package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.ChecklistItemInstance; // Corrected import
import com.example.backend.domain.postadoption.SubmissionInstance; // Corrected import
import com.example.backend.domain.postadoption.enums.PostAdoptionStepTimeStatus;
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

    @OneToMany(mappedBy = "postAdoptionStepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItemInstance> checklistItems = new ArrayList<>();

    @OneToMany(mappedBy = "postAdoptionStepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissionInstance> submissionItems = new ArrayList<>();

    public PostAdoptionStepInstance(PostAdoption postAdoption, String stepName, String description, Integer stepOrder, PostAdoptionStepDef postAdoptionStepDef, LocalDate dueDate) {
        this.postAdoption = postAdoption;
        this.stepName = stepName;
        this.description = description;
        this.stepOrder = stepOrder;
        this.postAdoptionStepDef = postAdoptionStepDef;
        this.dueDate = dueDate;
        this.checklistItems = new ArrayList<>();
        this.submissionItems = new ArrayList<>();
    }
}
