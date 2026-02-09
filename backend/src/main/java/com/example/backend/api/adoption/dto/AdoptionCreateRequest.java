package com.example.backend.api.adoption.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdoptionCreateRequest {


    @NotNull(message = "유기견 ID는 필수입니다.")
    private Long abandonedDogId;
}
