package com.example.backend.domain.adoption.step.counseling;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.enums.AdoptionCounselingStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AdoptionCounseling {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_id", nullable = false)
    private Adoption adoption;

    @Column(nullable = false)
    private LocalDateTime counselingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionCounselingStatus status;

    @Builder
    public AdoptionCounseling(Adoption adoption, LocalDateTime counselingDate) {
        this.adoption = adoption;
        this.counselingDate = counselingDate;
        this.status = AdoptionCounselingStatus.SCHEDULED;
    }

    public void updateCounseling(LocalDateTime counselingDate) {
        this.counselingDate = counselingDate;
    }

    public void cancel() {
        this.status = AdoptionCounselingStatus.CANCELED;
    }
}
