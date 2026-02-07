package com.example.backend.api.recommendation.dto;

public record RecommendedDogDto(
        Long dogId,
        double similarity
) {}