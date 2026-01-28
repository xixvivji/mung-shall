package com.example.backend.api.adoption.dto.counseling;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CounselingModificationRequest {
    @NotNull(message = "새로운 상담 날짜 및 시간은 필수입니다.")
    private LocalDateTime newCounselingDateTime;
}
