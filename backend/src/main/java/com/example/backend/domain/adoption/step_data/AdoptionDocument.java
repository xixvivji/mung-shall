package com.example.backend.domain.adoption.step_data;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "adoption_document")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionDocument {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private AdoptionStepInstance stepInstance;

    @Column(nullable = false)
    private String documentType; // e.g., "Household Register", "Income Statement"

    @Column(nullable = false)
    private String documentFileUrl; // URL to the uploaded document

    private String description;
}
