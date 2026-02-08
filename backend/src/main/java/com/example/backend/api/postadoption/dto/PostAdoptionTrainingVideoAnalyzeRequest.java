package com.example.backend.api.postadoption.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class PostAdoptionTrainingVideoAnalyzeRequest {

    @NotNull
    private MultipartFile file;

    @NotBlank
    private String targetAction;

    @NotNull
    private Double targetDuration;
}
