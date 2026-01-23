package com.example.backend.domain.adoption.step_data;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_education_cert")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionEducationCert {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private AdoptionStepInstance stepInstance;

    @Column(nullable = false)
    private String educationInstitution;

    @Column(nullable = false)
    private String certificateNumber;

    @Column(nullable = false)
    private LocalDateTime completionDate;

    // Optional: URL to the certificate image/document
    private String certificateFileUrl;
}
