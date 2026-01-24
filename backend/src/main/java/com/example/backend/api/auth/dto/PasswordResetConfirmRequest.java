package com.example.backend.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordResetConfirmRequest {

    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}
