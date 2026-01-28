package com.example.backend.service.adoption;

import com.example.backend.api.adoption.dto.document.UploadedDocumentResponse;
import com.example.backend.common.file.FileStorageService;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.domain.adoption.step.document.UploadedDocument;
import com.example.backend.domain.adoption.step.document.AdoptionDocument;
import com.example.backend.repository.adoption.document.AdoptionDocumentRepository;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import com.example.backend.repository.adoption.document.UploadedDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionDocumentService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionDocumentRepository adoptionDocumentRepository;
    private final UploadedDocumentRepository uploadedDocumentRepository;
    private final FileStorageService fileStorageService;

    /**
     * 입양 프로세스에 필요한 여러 종류의 문서를 업로드하고 관련 정보를 저장합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param documentTypes 각 파일의 DocumentType을 매핑한 맵 (예: "files[0]" -> DocumentType.RESIDENT_REGISTRATION_COPY)
     * @param files 실제 파일 목록
     */
    @Transactional
    public void uploadAdoptionDocuments(Long adoptionId, Map<String, DocumentType> documentTypes, List<MultipartFile> files) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        // '문서 제출' 단계 인스턴스 찾기
        AdoptionStepInstance documentStepInstance = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("문서 제출 단계를 찾을 수 없습니다."));

        // 현재 단계가 PENDING, SUBMITTED, REJECTED 상태인지 확인
        if (documentStepInstance.getStatus() != AdoptionStepStatus.PENDING &&
                documentStepInstance.getStatus() != AdoptionStepStatus.SUBMITTED &&
                documentStepInstance.getStatus() != AdoptionStepStatus.REJECTED) {
            throw new IllegalStateException("문서 제출 단계가 현재 '제출 대기', '제출 완료' 또는 '반려' 상태가 아닙니다.");
        }

        // AdoptionDocument (단계 데이터) 조회 또는 생성
        AdoptionDocument adoptionDocumentStep = adoptionDocumentRepository.findByStepInstanceId(documentStepInstance.getId())
                .orElseGet(() -> {
                    AdoptionDocument newDocStep = new AdoptionDocument();
                    newDocStep.setStepInstance(documentStepInstance);
                    return adoptionDocumentRepository.save(newDocStep);
                });

        // 기존에 업로드된 문서들을 삭제 (새로 업로드하는 경우 기존 문서들을 대체한다고 가정)
        // 또는 기존 문서들을 유지하고 추가하는 로직으로 변경 가능
        uploadedDocumentRepository.deleteAll(adoptionDocumentStep.getUploadedDocuments());
        adoptionDocumentStep.getUploadedDocuments().clear();


        // 각 파일 처리
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String fileKey = "files[" + i + "]"; // 컨트롤러에서 Map<String, DocumentType>으로 받을 때의 키 형식
            DocumentType docType = documentTypes.get(fileKey); // 해당 파일의 DocumentType 가져오기

            if (docType == null) {
                throw new IllegalArgumentException("DocumentType not specified for file: " + file.getOriginalFilename());
            }

            try {
                String storedFilePath = fileStorageService.storeFile(file, "adoption-documents"); // 'uploads/adoption-documents'에 저장

                UploadedDocument uploadedDocument = new UploadedDocument();
                uploadedDocument.setAdoptionDocument(adoptionDocumentStep);
                uploadedDocument.setDocumentType(docType);
                uploadedDocument.setFilePath(storedFilePath);
                uploadedDocument.setOriginalFileName(file.getOriginalFilename());
                uploadedDocument.setFileSize(file.getSize());
                // status는 @PrePersist에서 PENDING으로 설정됨

                uploadedDocumentRepository.save(uploadedDocument); // DB에 문서 메타데이터 저장
                adoptionDocumentStep.getUploadedDocuments().add(uploadedDocument); // AdoptionDocument에 추가
            } catch (IOException e) {
                throw new RuntimeException("Failed to store file: " + file.getOriginalFilename(), e);
            }
        }
        adoptionDocumentRepository.save(adoptionDocumentStep); // 변경된 uploadedDocuments 목록 저장

        // 단계 상태 업데이트
        documentStepInstance.setStatus(AdoptionStepStatus.SUBMITTED); // 제출 완료 상태로 변경
        documentStepInstance.setSubmittedAt(LocalDateTime.now());
        adoptionStepInstanceRepository.save(documentStepInstance);
    }

    /**
     * 특정 입양 프로세스에 업로드된 모든 문서를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 업로드된 문서 정보 DTO 목록
     */
    @Transactional(readOnly = true)
    public List<UploadedDocumentResponse> getUploadedDocuments(Long adoptionId) {
        // '문서 제출' 단계 인스턴스 찾기
        AdoptionStepInstance documentStepInstance = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 4)
                .orElseThrow(() -> new IllegalArgumentException("문서 제출 단계를 찾을 수 없습니다."));

        // AdoptionDocument (단계 데이터) 조회
        AdoptionDocument adoptionDocumentStep = adoptionDocumentRepository.findByStepInstanceId(documentStepInstance.getId())
                .orElseThrow(() -> new IllegalStateException("문서 제출 데이터가 존재하지 않습니다."));

        return adoptionDocumentStep.getUploadedDocuments().stream()
                .map(UploadedDocumentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 업로드된 특정 문서를 삭제합니다.
     *
     * @param adoptionId 입양 프로세스 ID (권한 확인용)
     * @param documentId 삭제할 문서의 ID
     */
    public void deleteUploadedDocument(Long adoptionId, Long documentId) {
        UploadedDocument document = uploadedDocumentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with ID: " + documentId));

        // 해당 입양 프로세스에 속한 문서가 맞는지 확인
        if (!document.getAdoptionDocument().getStepInstance().getAdoption().getId().equals(adoptionId)) {
            throw new SecurityException("User does not have permission to delete this document.");
        }

        try {
            // 물리적 파일 삭제
            fileStorageService.deleteFile(document.getFilePath(), "adoption-documents");
        } catch (IOException e) {
            // 파일이 없어도 그냥 진행하고 DB만 삭제하도록 할 수 있음. 일단은 예외 던지기.
            throw new RuntimeException("Failed to delete physical file: " + document.getFilePath(), e);
        }

        // 데이터베이스에서 문서 정보 삭제
        uploadedDocumentRepository.delete(document);
    }
}
