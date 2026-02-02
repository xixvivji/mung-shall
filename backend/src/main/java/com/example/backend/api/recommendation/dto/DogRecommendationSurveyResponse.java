package com.example.backend.api.recommendation.dto;

import com.example.backend.domain.recommendation.DogRecommendationSurvey;
import com.example.backend.domain.survey.enums.FurTolerance;
import com.example.backend.domain.survey.enums.HouseEmptyTime;
import com.example.backend.domain.survey.enums.ResidenceType;
import com.example.backend.domain.survey.enums.RestActivityLevel;
import com.example.backend.domain.survey.enums.VisitorFrequency;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class DogRecommendationSurveyResponse {
    private Long id;
    private Long userId;
    private RestActivityLevel restActivityLevel;
    private ResidenceType residenceType;
    private HouseEmptyTime houseEmptyTime;
    private FurTolerance furTolerance;
    private VisitorFrequency visitorFrequency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DogRecommendationSurveyResponse fromEntity(DogRecommendationSurvey survey) {
        return DogRecommendationSurveyResponse.builder()
                .id(survey.getId())
                .userId(survey.getUser().getUserId())
                .restActivityLevel(survey.getRestActivityLevel())
                .residenceType(survey.getResidenceType())
                .houseEmptyTime(survey.getHouseEmptyTime())
                .furTolerance(survey.getFurTolerance())
                .visitorFrequency(survey.getVisitorFrequency())
                .createdAt(survey.getCreatedAt())
                .updatedAt(survey.getUpdatedAt())
                .build();
    }
}
