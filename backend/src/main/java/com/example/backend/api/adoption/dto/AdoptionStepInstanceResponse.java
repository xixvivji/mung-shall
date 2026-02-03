package com.example.backend.api.adoption.dto;

import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AdoptionStepInstanceResponse {
    private Long id;
    private AdoptionStepDefResponse stepDef;
    private AdoptionStepStatus status;
    private Long approverUserId;
    private String approverUserName;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;
}
