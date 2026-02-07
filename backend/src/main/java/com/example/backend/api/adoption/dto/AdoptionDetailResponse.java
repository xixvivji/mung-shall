package com.example.backend.api.adoption.dto;

import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdoptionDetailResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long dogId;
    private AdoptionProcessStatus processStatus;
    private AdoptionStatus status;
    private String rejectionReason;
    private List<AdoptionStepSummaryResponse> steps;
}
