package com.example.backend.repository;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionStepInstanceRepository extends JpaRepository<AdoptionStepInstance, Long> {
    List<AdoptionStepInstance> findByAdoptionIdOrderByStepDefStepOrderAsc(Long adoptionId);
    Optional<AdoptionStepInstance> findByAdoptionIdAndStepDefStepName(Long adoptionId, String stepName);
}
