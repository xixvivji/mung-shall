package com.example.backend.api.recommendation.dto;

import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.domain.dog.DogAdoptionStatus;

public record RecommendedDogDto(
        Long dogId,
        String imageUrl,
        String kindNm,
        String age,
        String weight,
        String careNm,
        boolean isLiked,
        DogAdoptionStatus adoptionStatus,
        double similarity
) {
    public static RecommendedDogDto fromSummary(DogSummaryResponse summary, double similarity) {
        return new RecommendedDogDto(
                summary.getDogId(),
                summary.getImageUrl(),
                summary.getKindNm(),
                summary.getAge(),
                summary.getWeight(),
                summary.getCareNm(),
                summary.isLiked(),
                summary.getAdoptionStatus(),
                similarity
        );
    }
}
