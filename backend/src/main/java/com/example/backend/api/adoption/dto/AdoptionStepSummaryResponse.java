package com.example.backend.api.adoption.dto;

import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdoptionStepSummaryResponse {
    private Long id;
    private AdoptionStepStatus status;
}
