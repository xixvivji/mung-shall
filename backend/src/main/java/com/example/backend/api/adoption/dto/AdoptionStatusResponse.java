package com.example.backend.api.adoption.dto;

import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdoptionStatusResponse {
    private Long userId;
    private Long dogId;
    private Long adoptionId;
    private String imageUrl;
    private String kindNm;
    private String age;
    private String weight;
    private String careNm;
    private AdoptionProcessStatus processStatus;
}
