package com.example.backend.domain.adoption.step.document;

import com.example.backend.domain.adoption.AdoptionStepInstance; // UPDATED IMPORT
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "adoptionDocument", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UploadedDocument> uploadedDocuments = new ArrayList<>();

    private String description; // Keep description if it's for the step itself
}