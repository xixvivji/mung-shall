package com.example.backend.api.postadoption.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class SubmissionUploadRequest {
    @NotNull(message = "제출 항목 ID는 null일 수 없습니다.")
    private Long submissionId;
    
    // MultipartFile은 @RequestPart로 받으므로 DTO 필드에 직접 포함하지 않음
    // 하지만 Swagger 문서화를 위해 여기에 명시적으로 필드를 두는 경우도 있음.
    // 실제 컨트롤러에서는 @RequestPart("file") MultipartFile file 로 받을 것임.
    private MultipartFile file; 
}
