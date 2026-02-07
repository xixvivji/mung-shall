package com.example.backend.repository.adoption;

import com.example.backend.domain.adoption.AdoptionStepInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionStepInstanceRepository extends JpaRepository<AdoptionStepInstance, Long> {
    List<AdoptionStepInstance> findByAdoptionIdOrderByStepDefStepOrderAsc(Long adoptionId);
    Optional<AdoptionStepInstance> findByAdoptionIdAndStepDefStepOrder(Long adoptionId, Integer stepOrder);

    Optional<AdoptionStepInstance> findByIdAndAdoptionId(Long stepInstanceId, Long adoptionId);
}
