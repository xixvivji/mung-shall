package com.example.backend.repository;

import com.example.backend.domain.adoption.step_data.AdoptionEducationCert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionEducationCertRepository extends JpaRepository<AdoptionEducationCert, Long> {
    Optional<AdoptionEducationCert> findByStepInstanceId(Long stepInstanceId);
}
