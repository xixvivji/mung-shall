package com.example.backend.api.adoption.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StepVerificationRequest {

    @NotNull(message = "승인 여부를 입력해주세요.")
    private Boolean isApproved;

    private String rejectionReason;
}
