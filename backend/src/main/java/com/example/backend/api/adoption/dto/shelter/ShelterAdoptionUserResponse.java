package com.example.backend.api.adoption.dto.shelter;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ShelterAdoptionUserResponse {
    private Long adoptionId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private Long abandonedDogId;
    private String abandonedDogKindNm; // 품종명
    private String abandonedDogDesertionNo; // 유기번호
}
