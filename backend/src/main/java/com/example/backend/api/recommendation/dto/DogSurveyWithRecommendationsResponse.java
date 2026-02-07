package com.example.backend.api.recommendation.dto;

import java.util.List;

public record DogSurveyWithRecommendationsResponse(
        DogRecommendationSurveyResponse survey,
        List<RecommendedDogDto> recommendations
) {}