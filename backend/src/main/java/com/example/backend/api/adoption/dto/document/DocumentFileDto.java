package com.example.backend.api.adoption.dto.document;

import com.example.backend.domain.adoption.enums.DocumentType; // UPDATED IMPORT
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class DocumentFileDto {
    private DocumentType documentType; // 이 파일의 종류
    private MultipartFile file;        // 실제 파일 데이터
}