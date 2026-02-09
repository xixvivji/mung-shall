package com.example.backend.service.recommendation.cache;

import com.example.backend.repository.recommendation.EmbeddingCacheRepository;
import com.example.backend.config.FloatVectorCodecConfig;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class EmbeddingCachingService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingCacheKeyFactory keyFactory;
    private final EmbeddingCacheRepository cacheRepository;

    // Spring AI embedding model name을 네가 properties로 고정해둔 값과 동일하게 둠
    @Getter
    @Value("${spring.ai.openai.embedding.options.model:text-embedding-3-large}")
    private String embeddingModelName;

    @Value("${spring.ai.openai.embedding.options.dimensions:1024}")
    private int embeddingDim;

    /**
     * dogId + normalizedText(=augmentedText) 기준으로 임베딩을 캐시에서 가져오거나 생성.
     */
    public float[] getOrCreateDogEmbedding(long dogId, String normalizedText) {
        String text = keyFactory.canonicalize(normalizedText);
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("normalizedText must not be blank");
        }

        String modelKey = keyFactory.modelKey(embeddingModelName);
        String th = keyFactory.textHash(text);

        String latestKey = keyFactory.dogEmbeddingLatestKey(dogId, modelKey);

        // ✅ vec/meta 키를 분리
        String vecKey = keyFactory.dogEmbeddingVecKey(dogId, modelKey, th);
        String metaKey = keyFactory.dogEmbeddingMetaKey(dogId, modelKey, th);

        // 1) latest 포인터가 있으면 vec 바로 시도
        String latestVecKey = cacheRepository.getLatestPointer(latestKey);
        if (StringUtils.hasText(latestVecKey)) {
            byte[] vecBlob = cacheRepository.getVector(latestVecKey);
            if (vecBlob != null) {
                return FloatVectorCodecConfig.bytesToFloats(vecBlob);
            }
        }

        // 2) 없으면 현재 vecKey로 조회
        byte[] hit = cacheRepository.getVector(vecKey);
        if (hit != null) {
            cacheRepository.putLatestPointer(latestKey, vecKey);
            return FloatVectorCodecConfig.bytesToFloats(hit);
        }

        // 3) 캐시 미스면 생성 → vec 저장 → meta 저장 → latest 갱신
        float[] vector = embeddingModel.embed(text);
        byte[] blob = FloatVectorCodecConfig.floatsToBytes(vector);

        cacheRepository.putVector(vecKey, blob);
        cacheRepository.putMetaHash(metaKey, embeddingDim, modelKey, th);
        cacheRepository.putLatestPointer(latestKey, vecKey);

        return vector;
    }

    /** 디버깅/로깅용 */
    public String getEmbeddingModelKey() {
        return keyFactory.modelKey(embeddingModelName);
    }

}
