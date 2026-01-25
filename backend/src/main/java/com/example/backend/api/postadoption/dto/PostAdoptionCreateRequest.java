package com.example.backend.api.postadoption.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostAdoptionCreateRequest {
    @NotNull(message = "입양 ID는 필수입니다.")
    private Long adoptionId;
}
