package com.example.backend.api.adoption.dto.educationcert;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AdoptionEducationCertUploadRequest {

    @NotBlank(message = "교육 기관명은 필수입니다.")
    private String educationInstitution;

    @NotBlank(message = "수료증 번호는 필수입니다.")
    private String certificateNumber;

    @NotNull(message = "수료일은 필수입니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime completionDate;

    @NotNull(message = "수료증 파일은 필수입니다.")
    private MultipartFile certificateFile;
}
