package com.example.backend.api.recommendation.dto;

public record RecommendedDogDto(
        Long dogId,
        double similarity
        // 필요하면 kindNm, popfile1 같은 카드 필드 추가
) {}