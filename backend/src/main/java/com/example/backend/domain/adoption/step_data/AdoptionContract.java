package com.example.backend.domain.adoption.step_data;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_contract")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionContract {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private AdoptionStepInstance stepInstance;

    @Column(nullable = false)
    private String contractContent; // Could be a text field or a URL to a stored document

    @Column(nullable = false)
    private LocalDateTime contractDate;

    @Column(nullable = false)
    private String signeeName; // Name of the adopter who signed

    private String signatureImageUrl; // Optional: URL to an image of the signature
}
