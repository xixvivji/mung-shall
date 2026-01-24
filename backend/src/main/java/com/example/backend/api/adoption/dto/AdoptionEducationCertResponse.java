package com.example.backend.api.adoption.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AdoptionEducationCertResponse {
    private Long id;
    private Long stepInstanceId;
    private String educationInstitution;
    private String certificateNumber;
    private LocalDateTime completionDate;
    private String certificateFileUrl;
}
