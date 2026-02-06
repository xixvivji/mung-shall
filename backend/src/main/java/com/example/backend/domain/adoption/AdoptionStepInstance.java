package com.example.backend.domain.adoption;

import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.step.contract.AdoptionContract;
import com.example.backend.domain.adoption.step.document.AdoptionDocument;
import com.example.backend.domain.adoption.step.educationcert.AdoptionEducationCert;
import com.example.backend.domain.adoption.step.survey.AdoptionSurvey;
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

    private LocalDateTime submittedAt; // 입양 상담 단계는 상담 신청 시간
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    @OneToOne(mappedBy = "stepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private AdoptionEducationCert adoptionEducationCert;

    @OneToOne(mappedBy = "stepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private AdoptionContract adoptionContract;

    @OneToOne(mappedBy = "stepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private AdoptionDocument adoptionDocument;

    @OneToOne(mappedBy = "stepInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    private AdoptionSurvey adoptionSurvey;
}
