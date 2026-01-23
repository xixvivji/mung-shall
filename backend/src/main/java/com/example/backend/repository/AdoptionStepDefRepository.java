package com.example.backend.repository;

import com.example.backend.domain.adoption.AdoptionStepDef;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionStepDefRepository extends JpaRepository<AdoptionStepDef, Long> {
    List<AdoptionStepDef> findAllByOrderByStepOrderAsc();
    Optional<AdoptionStepDef> findByStepName(String stepName);
}
