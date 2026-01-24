package com.example.backend.domain.adoption.step_data;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.CounselingType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_counseling")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionCounseling {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private AdoptionStepInstance stepInstance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CounselingType counselingType; // e.g., VISIT, VIDEO

    @Column(nullable = false)
    private LocalDateTime counselingDate;

    @Column(nullable = false)
    private String counselingLocation;

    @Column(columnDefinition = "TEXT")
    private String counselorNotes; // Notes from the shelter counselor
}
