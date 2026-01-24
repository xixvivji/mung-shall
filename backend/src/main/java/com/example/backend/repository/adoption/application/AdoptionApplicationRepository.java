package com.example.backend.repository.adoption.application;

import com.example.backend.domain.adoption.step_data.application.AdoptionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionApplicationRepository extends JpaRepository<AdoptionApplication, Long> {
    Optional<AdoptionApplication> findByStepInstanceId(Long stepInstanceId);
}
