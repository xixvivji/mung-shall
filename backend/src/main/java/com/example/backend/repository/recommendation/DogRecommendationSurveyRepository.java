package com.example.backend.repository.recommendation;

import com.example.backend.domain.recommendation.DogRecommendationSurvey;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DogRecommendationSurveyRepository extends JpaRepository<DogRecommendationSurvey, Long> {
    Optional<DogRecommendationSurvey> findByUserUserId(Long userId);
}
