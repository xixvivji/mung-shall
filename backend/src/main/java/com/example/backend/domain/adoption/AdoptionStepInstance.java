package com.example.backend.domain.adoption;

import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_step_instance", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"adoption_id", "step_def_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class AdoptionStepInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_id", nullable = false)
    private Adoption adoption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_def_id", nullable = false)
    private AdoptionStepDef stepDef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionStepStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id") // Optional, only set when approved/rejected
    private User approver;

    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    // One-to-one relationships to specific step data
    // These will be mapped by their respective entities
}
