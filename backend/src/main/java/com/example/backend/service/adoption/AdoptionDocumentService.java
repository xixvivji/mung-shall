package com.example.backend.service.adoption;

import com.example.backend.common.file.FileStorageService;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.domain.adoption.step_data.document.UploadedDocument;
import com.example.backend.domain.adoption.step_data.document.AdoptionDocument;
import com.example.backend.repository.adoption.document.AdoptionDocumentRepository;
import com.example.backend.repository.AdoptionRepository;
import com.example.backend.repository.adoption.step.AdoptionStepInstanceRepository;
import com.example.backend.repository.adoption.document.UploadedDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
                .findByAdoptionIdAndStepDefStepName(adoptionId, "문서 제출") // StepDef의 stepName과 일치해야 함
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
}
