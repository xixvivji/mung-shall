package com.example.backend.service.recommendation.embedd;

import com.example.backend.domain.dog.AbandonedDog;

public interface DogPersonalityAugmentationService {

    /**
     * 유기견(AbandonedDog) 원본 필드를 기반으로
     * 5개 성향(활동성/짖음/분리불안/털빠짐/친화력)을 포함한 "정규화된 증강 텍스트" 생성
     */
    AugmentationResult build(AbandonedDog dog);

    record AugmentationResult(
            String augmentedText,
            String activitySummary,
            String barkingSummary,
            String separationAnxietySummary,
            String sheddingSummary,
            String friendlinessSummary,
            boolean hasUncertainTrait // 일부 특성이 근거 부족으로 "추정" 포함 여부
    ) {}

}
