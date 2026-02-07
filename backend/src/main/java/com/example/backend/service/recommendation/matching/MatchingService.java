package com.example.backend.service.recommendation.matching;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import com.example.backend.repository.dog.personality.DogPersonalityRepository;
import com.example.backend.service.recommendation.cache.EmbeddingCachingService;
import com.example.backend.service.recommendation.embedd.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

@Slf4j
@Service
@RequiredArgsConstructor
public class MatchingService {

    private final DogPersonalityRepository dogPersonalityRepository;
    private final EmbeddingService embeddingService;
    private final EmbeddingCachingService embeddingCachingService;

    public List<DogMatch> match(DogRecommendationSurveyResponse servey, int topK) {
        if(topK <= 0) topK = 20;

        // 설문 임베딩
        float[] userVec = embeddingService.embedAdopterSurvey(servey);

        // 후보 : dogId + augmentedText 한번에 로딩
        List<DogPersonalityRepository.DogTextProjection> candidates =
                dogPersonalityRepository.findAllDogTextProjections();

        // topK 힙 구조 생성
        PriorityQueue<DogMatch> heap = new PriorityQueue<>(Comparator.comparingDouble(DogMatch::similarity));

        int processed = 0;
        for (var c : candidates) {
            Long dogId = c.getDogId();
            String text = c.getAugmentedText();
            if (dogId == null || text == null || text.isBlank()) continue;

            // 캐시 기준 normalize (공백 정규화)
            String normalized = embeddingService.normalizeDogText(text);

            // dog 임베딩: Redis 캐시 hit/miss
            float[] dogVec = embeddingCachingService.getOrCreateDogEmbedding(dogId, normalized);

            double sim = VectorMath.cosine(userVec, dogVec);

            // heap 유지
            if (heap.size() < topK) {
                heap.offer(new DogMatch(dogId, sim));
            } else if (!heap.isEmpty() && sim > heap.peek().similarity()) {
                heap.poll();
                heap.offer(new DogMatch(dogId, sim));
            }

            processed++;
            if (processed % 500 == 0) {
                log.info("[Matching] processed candidates={}/{}", processed, candidates.size());
            }
        }

        // 내림차순 정렬 반환
        List<DogMatch> out = new ArrayList<>(heap);
        out.sort(Comparator.comparingDouble(DogMatch::similarity).reversed());
        log.info("[Matching] done. candidates={}, returnedTopK={}", candidates.size(), out.size());
        return out;
    }

    public record DogMatch(Long dogId, double similarity) {}

}
