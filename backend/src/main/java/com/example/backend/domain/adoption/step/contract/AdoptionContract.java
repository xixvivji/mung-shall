package com.example.backend.domain.adoption.step.contract;

import com.example.backend.domain.adoption.AdoptionStepInstance;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_contract")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_instance_id", nullable = false)
    private AdoptionStepInstance stepInstance;

    @Column(name = "contract_file_url", nullable = false)
    private String contractFileUrl;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }
}
