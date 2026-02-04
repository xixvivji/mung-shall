package com.example.backend.api.adoption.dto.shelter;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ShelterAdoptionDogResponse {
    // Dog Information
    private Long abandonedDogId;
    private String abandonedDogKindNm; // 품종명
    private String abandonedDogDesertionNo; // 유기번호
    private String dogImageUrl; // 강아지 이미지 URL

    // Adoption Information
    private Long adoptionId;
    private Long applicantUserId;
    private String applicantUsername;
    private String applicantUserEmail;
    private String applicantUserPhone;
    private AdoptionProcessStatus adoptionProcessStatus; // 입양 진행 상태

    // Current Step Information
    private String currentStepName; // 현재 단계 이름
    private AdoptionStepStatus currentStepStatus; // 현재 단계 상태
    private Integer currentStepOrder; // 현재 단계 순서

    public static ShelterAdoptionDogResponse from(Adoption adoption, AdoptionStepInstance currentStep) {
        String currentStepName = (currentStep != null && currentStep.getStepDef() != null) ? currentStep.getStepDef().getStepName() : null;
        AdoptionStepStatus currentStepStatus = currentStep != null ? currentStep.getStatus() : null;
        Integer currentStepOrder = (currentStep != null && currentStep.getStepDef() != null) ? currentStep.getStepDef().getStepOrder() : null;

        return ShelterAdoptionDogResponse.builder()
                .abandonedDogId(adoption.getAbandonedDog().getId())
                .abandonedDogKindNm(adoption.getAbandonedDog().getKindNm())
                .abandonedDogDesertionNo(adoption.getAbandonedDog().getDesertionNo())
                .dogImageUrl(adoption.getAbandonedDog().getPopfile1())
                .adoptionId(adoption.getId())
                .applicantUserId(adoption.getUser().getUserId())
                .applicantUsername(adoption.getUser().getName())
                .applicantUserEmail(adoption.getUser().getEmail())
                .applicantUserPhone(adoption.getUser().getPhone())
                .adoptionProcessStatus(adoption.getProcessStatus())
                .currentStepName(currentStepName)
                .currentStepStatus(currentStepStatus)
                .currentStepOrder(currentStepOrder)
                .build();
    }
}
