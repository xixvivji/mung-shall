package com.example.backend.repository.adoption.survey;

import com.example.backend.domain.adoption.step.survey.AdoptionSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionSurveyRepository extends JpaRepository<AdoptionSurvey, Long> {
    Optional<AdoptionSurvey> findByStepInstanceId(Long stepInstanceId);
}
