package com.example.backend.api.recommendation.dto;

import com.example.backend.domain.survey.enums.FurTolerance;
import com.example.backend.domain.survey.enums.HouseEmptyTime;
import com.example.backend.domain.survey.enums.ResidenceType;
import com.example.backend.domain.survey.enums.RestActivityLevel;
import com.example.backend.domain.survey.enums.VisitorFrequency;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DogRecommendationSurveyCreateRequest {
    @NotNull
    private Long userId;
    @NotNull
    private RestActivityLevel restActivityLevel;
    @NotNull
    private ResidenceType residenceType;
    @NotNull
    private HouseEmptyTime houseEmptyTime;
    @NotNull
    private FurTolerance furTolerance;
    @NotNull
    private VisitorFrequency visitorFrequency;
}
