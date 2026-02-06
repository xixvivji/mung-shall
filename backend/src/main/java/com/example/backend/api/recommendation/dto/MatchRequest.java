package com.example.backend.api.recommendation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MatchRequest {

    private DogRecommendationSurveyResponse survey;
    private Integer topK;

}
