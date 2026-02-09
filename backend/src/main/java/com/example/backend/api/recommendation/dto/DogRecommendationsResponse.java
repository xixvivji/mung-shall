package com.example.backend.api.recommendation.dto;

import java.util.List;

public record DogRecommendationsResponse(
        List<RecommendedDogDto> recommendations
) {}