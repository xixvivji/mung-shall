package com.example.backend.api.postadoption.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostAdoptionStepSubmitRequest {
    @NotBlank(message = "제출할 데이터는 비어 있을 수 없습니다.")
    private String data; // 임시로 String 타입으로, 실제 데이터는 각 단계별 DTO로 대체될 수 있음
}
