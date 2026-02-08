package com.example.backend.service.recommendation;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import com.example.backend.service.recommendation.cache.RecommendationCacheEntry;
import com.example.backend.service.recommendation.cache.RecommendationCacheService;
import com.example.backend.service.recommendation.cache.RecommendationMatch;
import com.example.backend.service.recommendation.matching.MatchingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationAsyncService {

    private static final int TOP_K = 12;

    private final MatchingService matchingService;
    private final RecommendationCacheService recommendationCacheService;

    @Async("recommendationTaskExecutor")
    public void generateRecommendations(DogRecommendationSurveyResponse survey) {
        if (survey == null || survey.getUserId() == null) {
            return;
        }

        Long userId = survey.getUserId();
        try {
            var matches = matchingService.match(survey, TOP_K);
            List<RecommendationMatch> cachedMatches = matches.stream()
                    .map(match -> new RecommendationMatch(match.dogId(), match.similarity()))
                    .toList();

            RecommendationCacheEntry entry = new RecommendationCacheEntry(
                    userId,
                    survey.getUpdatedAt(),
                    cachedMatches
            );

            recommendationCacheService.saveIfNewer(userId, entry);
        } catch (Exception ex) {
            log.warn("Failed to generate recommendations for userId={}", userId, ex);
        }
    }
}
