package com.example.backend.api.adoption.dto.document;

import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.domain.adoption.step.document.UploadedDocument;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UploadedDocumentResponse {

    private Long id;
    private DocumentType documentType;
    private String originalFileName;
    private String filePath;
    private long fileSize;

    public static UploadedDocumentResponse fromEntity(UploadedDocument entity) {
        return new UploadedDocumentResponse(
                entity.getId(),
                entity.getDocumentType(),
                entity.getOriginalFileName(),
                entity.getFilePath(),
                entity.getFileSize()
        );
    }
}
