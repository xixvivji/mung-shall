package com.example.backend.api.postadoption.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
    @Schema(type = "string", format = "binary")
    private MultipartFile file;

    @NotBlank
    private String targetAction;

    @NotNull
    private Double targetDuration;
}
