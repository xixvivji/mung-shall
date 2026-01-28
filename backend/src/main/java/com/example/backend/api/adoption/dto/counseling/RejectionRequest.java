package com.example.backend.api.adoption.dto.counseling;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectionRequest {
    @NotBlank(message = "거절 사유는 필수입니다.")
    private String reason;
}
