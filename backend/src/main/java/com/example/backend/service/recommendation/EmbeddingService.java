package com.example.backend.service.recommendation;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmbeddingService {

    private final EmbeddingModel embeddingModel;
    private final SurveyTextSerializeService surveyTextSerializer;

    public EmbeddingService(EmbeddingModel embeddingModel,
                            SurveyTextSerializeService surveyTextSerializer) {
        this.embeddingModel = embeddingModel;
        this.surveyTextSerializer = surveyTextSerializer;
    }

    /** 입양자 설문 → (B안) 한글 정규화 텍스트 → 임베딩 */
    public float[] embedAdopterSurvey(DogRecommendationSurveyResponse survey) {
        String text = surveyTextSerializer.toKoreanNormalizedText(survey);
        return embeddingModel.embed(text);
    }

    /** 유기견 정규화 텍스트(키=값 문장)를 임베딩 */
    public float[] embedDogNormalizedText(String dogNormalizedText) {
        String text = sanitize(dogNormalizedText);
        return embeddingModel.embed(text);
    }

    /** 배치 임베딩: 여러 텍스트를 한 번에 임베딩 */
    public List<float[]> embedBatch(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            throw new IllegalArgumentException("texts must not be empty");
        }
        List<String> cleaned = new ArrayList<>(texts.size());
        for (String t : texts) cleaned.add(sanitize(t));
        return embeddingModel.embed(cleaned);
    }

    private String sanitize(String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("text must not be blank");
        }
        return text.trim().replaceAll("\\s+", " ");
    }
}
