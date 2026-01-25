package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.enums.PostAdoptionStepStatus;
import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

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

    public PostAdoptionStepInstance(PostAdoption postAdoption, String stepName, String description, Integer stepOrder, PostAdoptionStepStatus status, PostAdoptionStepDef postAdoptionStepDef) {
        this.postAdoption = postAdoption;
        this.stepName = stepName;
        this.description = description;
        this.stepOrder = stepOrder;
        this.status = status;
        this.postAdoptionStepDef = postAdoptionStepDef;
    }
}
