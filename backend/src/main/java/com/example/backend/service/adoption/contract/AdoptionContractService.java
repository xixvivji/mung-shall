package com.example.backend.service.adoption.contract;

import com.example.backend.api.adoption.dto.contract.AdoptionContractResponse;
import com.example.backend.common.file.FileStorageService;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.step.contract.AdoptionContract;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import com.example.backend.repository.adoption.contract.AdoptionContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionContractService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionContractRepository adoptionContractRepository;
    private final FileStorageService fileStorageService;

    private static final int ADOPTION_CONTRACT_STEP_ORDER = 5;
    private static final String FILE_STORAGE_SUBDIR = "adoption-contracts";

    /**
     * 입양 계약서 파일을 업로드하고 관련 정보를 저장합니다.
     *
     * @param adoptionId     입양 프로세스 ID
     * @param contractFile   입양 계약서 파일
     * @return 저장된 AdoptionContract의 응답 DTO
     */
    public AdoptionContractResponse uploadAdoptionContract(Long adoptionId, MultipartFile contractFile) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        AdoptionStepInstance contractStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, ADOPTION_CONTRACT_STEP_ORDER)
                .orElseThrow(() -> new IllegalArgumentException("입양 계약서 제출 단계를 찾을 수 없습니다."));

        if (contractStep.getStatus() != AdoptionStepStatus.PENDING &&
                contractStep.getStatus() != AdoptionStepStatus.SUBMITTED &&
                contractStep.getStatus() != AdoptionStepStatus.REJECTED) {
            throw new IllegalStateException("입양 계약서 제출 단계가 현재 '제출 대기' 또는 '반려' 상태가 아닙니다.");
        }

        // 기존 계약서가 있다면 삭제 (새로운 파일로 대체)
        adoptionContractRepository.findByStepInstanceId(contractStep.getId()).ifPresent(existingContract -> {
            try {
                fileStorageService.deleteFile(existingContract.getContractFileUrl(), FILE_STORAGE_SUBDIR);
            } catch (IOException e) {
                // 기존 파일 삭제 실패는 로그만 남기고 진행. 새 파일 업로드가 더 중요.
                System.err.println("Failed to delete existing contract file: " + existingContract.getContractFileUrl() + " - " + e.getMessage());
            }
            adoptionContractRepository.delete(existingContract);
        });

        String fileUrl;
        try {
            fileUrl = fileStorageService.storeFile(contractFile, FILE_STORAGE_SUBDIR);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store contract file", e);
        }

        AdoptionContract adoptionContract = new AdoptionContract();
        adoptionContract.setStepInstance(contractStep);
        adoptionContract.setContractFileUrl(fileUrl);
        adoptionContract.setOriginalFileName(contractFile.getOriginalFilename());
        adoptionContract.setFileSize(contractFile.getSize());
        // uploadedAt은 @PrePersist에서 자동 설정

        AdoptionContract savedContract = adoptionContractRepository.save(adoptionContract);

        contractStep.setStatus(AdoptionStepStatus.SUBMITTED);
        contractStep.setSubmittedAt(LocalDateTime.now());
        adoptionStepInstanceRepository.save(contractStep);

        return AdoptionContractResponse.fromEntity(savedContract);
    }

    /**
     * 특정 입양 프로세스의 입양 계약서 상세 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 입양 계약서 응답 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionContractResponse getAdoptionContract(Long adoptionId) {
        AdoptionStepInstance contractStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, ADOPTION_CONTRACT_STEP_ORDER)
                .orElseThrow(() -> new IllegalArgumentException("입양 계약서 제출 단계를 찾을 수 없습니다."));

        AdoptionContract adoptionContract = adoptionContractRepository.findByStepInstanceId(contractStep.getId())
                .orElseThrow(() -> new IllegalArgumentException("입양 계약서가 존재하지 않습니다."));

        return AdoptionContractResponse.fromEntity(adoptionContract);
    }

    /**
     * 제출된 입양 계약서를 삭제하고 단계를 초기 상태로 되돌립니다.
     *
     * @param adoptionId 입양 프로세스 ID
     */
    public void deleteAdoptionContract(Long adoptionId) {
        AdoptionStepInstance contractStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, ADOPTION_CONTRACT_STEP_ORDER)
                .orElseThrow(() -> new IllegalArgumentException("입양 계약서 제출 단계를 찾을 수 없습니다."));

        if (contractStep.getStatus() == AdoptionStepStatus.PENDING || contractStep.getStatus() == AdoptionStepStatus.NOT_STARTED) {
            return; // 삭제할 내용이 없음
        }

        if (contractStep.getStatus() == AdoptionStepStatus.COMPLETED) {
            throw new IllegalStateException("이미 승인 완료된 계약서는 삭제할 수 없습니다.");
        }

        AdoptionContract adoptionContract = adoptionContractRepository.findByStepInstanceId(contractStep.getId())
                .orElse(null);

        if (adoptionContract != null) {
            try {
                if (adoptionContract.getContractFileUrl() != null && !adoptionContract.getContractFileUrl().isEmpty()) {
                    fileStorageService.deleteFile(adoptionContract.getContractFileUrl(), FILE_STORAGE_SUBDIR);
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete contract file: " + adoptionContract.getContractFileUrl(), e);
            }
            adoptionContractRepository.delete(adoptionContract);
        }

        contractStep.setStatus(AdoptionStepStatus.PENDING);
        contractStep.setSubmittedAt(null);
        contractStep.setRejectionReason(null);
        adoptionStepInstanceRepository.save(contractStep);
    }
}
