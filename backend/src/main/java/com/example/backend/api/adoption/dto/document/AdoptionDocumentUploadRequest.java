package com.example.backend.api.adoption.dto.document;

import com.example.backend.domain.adoption.enums.DocumentType; // UPDATED IMPORT
import com.example.backend.api.adoption.dto.document.DocumentFileDto; // NEW IMPORT
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class AdoptionDocumentUploadRequest {
    private Long adoptionSurveyId; // 어떤 입양 설문에 대한 문서인지 식별
    private List<DocumentFileDto> documents; // 업로드할 문서 목록
}