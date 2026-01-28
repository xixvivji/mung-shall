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
    private AdoptionStepDefResponse stepDef; // 연결
    private AdoptionStepStatus status;
    private Long approverUserId; // 임시
    private String approverUserName; // 임시
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;
}
