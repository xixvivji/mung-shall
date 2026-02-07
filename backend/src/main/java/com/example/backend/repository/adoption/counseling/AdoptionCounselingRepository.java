package com.example.backend.repository.adoption.counseling;

import com.example.backend.domain.adoption.step.counseling.AdoptionCounseling;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdoptionCounselingRepository extends JpaRepository<AdoptionCounseling, Long> {
}
