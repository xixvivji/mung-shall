package com.example.backend.domain.adoption.step_data.document;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import com.example.backend.domain.adoption.step_data.document.AdoptionDocument; // Import AdoptionDocument
import com.example.backend.domain.adoption.enums.DocumentType; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.DocumentStatus; // UPDATED IMPORT

@Entity
@Table(name = "uploaded_documents")
@Getter
@Setter
@NoArgsConstructor
public class UploadedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_document_id", nullable = false)
    private AdoptionDocument adoptionDocument; // 이 문서가 속한 AdoptionDocument 단계

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType; // 문서 종류 (예: 주민등록등본, 임대차 계약서)

    @Column(name = "file_path", nullable = false)
    private String filePath; // 실제 파일이 저장된 경로 (FileStorageService에서 반환)

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName; // 사용자가 업로드한 원본 파일명

    @Column(name = "file_size", nullable = false)
    private Long fileSize; // 파일 크기 (바이트)

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate; // 업로드 일시

    // 문서 검토 상태 (예: PENDING, APPROVED, REJECTED)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DocumentStatus status; // DocumentStatus enum 필요

    @PrePersist
    protected void onCreate() {
        this.uploadDate = LocalDateTime.now();
        if (this.status == null) {
            this.status = DocumentStatus.PENDING; // 기본 상태는 PENDING
        }
    }
}