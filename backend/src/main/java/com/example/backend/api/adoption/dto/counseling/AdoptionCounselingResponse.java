package com.example.backend.api.adoption.dto.counseling;

import com.example.backend.domain.adoption.step.counseling.AdoptionCounseling;
import com.example.backend.domain.adoption.enums.AdoptionCounselingStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AdoptionCounselingResponse {
    private Long id;
    private Long adoptionId;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime counselingDate;
    private AdoptionCounselingStatus status;

    public AdoptionCounselingResponse(AdoptionCounseling counseling) {
        this.id = counseling.getId();
        this.adoptionId = counseling.getAdoption().getId();
        this.counselingDate = counseling.getCounselingDate();
        this.status = counseling.getStatus();
    }
}
