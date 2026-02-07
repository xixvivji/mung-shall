package com.example.backend.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmailVerifyRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String purpose;

    @NotBlank
    private String code;
}
