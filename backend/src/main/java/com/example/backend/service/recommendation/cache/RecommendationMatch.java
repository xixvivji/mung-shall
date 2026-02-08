package com.example.backend.service.recommendation.cache;

public record RecommendationMatch(
        Long dogId,
        double similarity
) {}
