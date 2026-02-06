package com.example.backend.api.postadoption.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class PostAdoptionStepResponse {
    private Long id;
    private String stepName;
    private String description;
    private Integer stepOrder;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;
}
