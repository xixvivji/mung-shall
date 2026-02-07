package com.example.backend.api.adoption.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AdoptionStepDefResponse {
    private Long id;
    private Integer stepOrder;
    private String stepName;
    private String description;
}
