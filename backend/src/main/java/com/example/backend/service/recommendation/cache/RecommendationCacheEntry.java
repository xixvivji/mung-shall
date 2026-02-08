package com.example.backend.service.recommendation.cache;

import java.time.LocalDateTime;
import java.util.List;

public record RecommendationCacheEntry(
        Long userId,
        LocalDateTime surveyUpdatedAt,
        List<RecommendationMatch> matches
) {}
