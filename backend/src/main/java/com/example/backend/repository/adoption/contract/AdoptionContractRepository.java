package com.example.backend.repository.adoption.contract;

import com.example.backend.domain.adoption.step.contract.AdoptionContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionContractRepository extends JpaRepository<AdoptionContract, Long> {
    Optional<AdoptionContract> findByStepInstanceId(Long stepInstanceId);
}
