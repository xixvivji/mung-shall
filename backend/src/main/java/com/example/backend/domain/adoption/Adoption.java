package com.example.backend.domain.adoption;

import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.domain.adoption.step.counseling.AdoptionCounseling;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "adoption", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "abandoned_dog_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Adoption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "shelter_id")
//    private User shelter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionProcessStatus processStatus;

    @Enumerated(EnumType.STRING)
    private AdoptionStatus status; // 최종 승인 여부 (null 가능 - 아직 최종평가x)

    private String rejectionReason; // 최종 반려 사유 - 테이블 구조 좋지 않아..

    @OneToMany(mappedBy = "adoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdoptionStepInstance> steps = new ArrayList<>();

    @OneToOne(mappedBy = "adoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private PostAdoption postAdoption;

    @OneToOne(mappedBy = "adoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private AdoptionCounseling adoptionCounseling;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    public void addStep(AdoptionStepInstance stepInstance) {
        steps.add(stepInstance);
        stepInstance.setAdoption(this);
    }
}