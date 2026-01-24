package com.example.backend.service.adoption;

import com.example.backend.api.adoption.dto.educationcert.AdoptionEducationCertResponse;
import com.example.backend.common.file.FileStorageService;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.step_data.educationcert.AdoptionEducationCert;
import com.example.backend.repository.adoption.educationcert.AdoptionEducationCertRepository;
import com.example.backend.repository.AdoptionRepository;
import com.example.backend.repository.adoption.step.AdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionEducationCertService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionEducationCertRepository adoptionEducationCertRepository;
    private final FileStorageService fileStorageService;

    /**
     * 입양 교육 수료증을 업로드하고 관련 정보를 저장합니다.
     *
     * @param adoptionId          입양 프로세스 ID
     * @param educationInstitution 교육 기관명
     * @param certificateNumber   수료증 번호
     * @param completionDate      수료일
     * @param certificateFile     수료증 파일
     * @return 저장된 AdoptionEducationCert의 응답 DTO
     */
    public AdoptionEducationCertResponse uploadEducationCertificate(
            Long adoptionId,
            String educationInstitution,
            String certificateNumber,
            LocalDateTime completionDate,
            MultipartFile certificateFile) {

        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        AdoptionStepInstance educationCertStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepName(adoptionId, "교육 수료증 제출") // StepDef의 stepName과 일치해야 함
                .orElseThrow(() -> new IllegalArgumentException("교육 수료증 제출 단계를 찾을 수 없습니다."));

        if (educationCertStep.getStatus() != AdoptionStepStatus.PENDING &&
                educationCertStep.getStatus() != AdoptionStepStatus.SUBMITTED &&
                educationCertStep.getStatus() != AdoptionStepStatus.REJECTED) {
            throw new IllegalStateException("교육 수료증 제출 단계가 현재 '제출 대기' 또는 '반려' 상태가 아닙니다.");
        }

        String fileUrl;
        try {
            // Store the file and get its URL/path
            fileUrl = fileStorageService.storeFile(certificateFile, "education-certs"); // Store in 'uploads/education-certs'
        } catch (IOException e) {
            throw new RuntimeException("Failed to store certificate file", e);
        }

        AdoptionEducationCert educationCert = adoptionEducationCertRepository.findByStepInstanceId(educationCertStep.getId())
                .orElse(new AdoptionEducationCert());

        educationCert.setStepInstance(educationCertStep);
        educationCert.setEducationInstitution(educationInstitution);
        educationCert.setCertificateNumber(certificateNumber);
        educationCert.setCompletionDate(completionDate);
        educationCert.setCertificateFileUrl(fileUrl);

        adoptionEducationCertRepository.save(educationCert);

        educationCertStep.setStatus(AdoptionStepStatus.SUBMITTED);
        educationCertStep.setSubmittedAt(LocalDateTime.now());
        adoptionStepInstanceRepository.save(educationCertStep);

        return mapAdoptionEducationCertToResponse(educationCert);
    }

    /**
     * 특정 입양 프로세스의 교육 수료증 상세 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 교육 수료증 응답 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionEducationCertResponse getEducationCertificate(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        AdoptionStepInstance educationCertStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepName(adoptionId, "교육 수료증 제출")
                .orElseThrow(() -> new IllegalArgumentException("교육 수료증 제출 단계를 찾을 수 없습니다."));

        AdoptionEducationCert educationCert = adoptionEducationCertRepository.findByStepInstanceId(educationCertStep.getId())
                .orElseThrow(() -> new IllegalArgumentException("교육 수료증이 존재하지 않습니다."));

        return mapAdoptionEducationCertToResponse(educationCert);
    }

    /**
     * 관리자가 입양 교육 수료증을 인증하거나 반려합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param isVerified 인증 여부 (true: 인증, false: 반려)
     */
    public void verifyEducationCertificate(Long adoptionId, Boolean isVerified) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        AdoptionStepInstance educationCertStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepName(adoptionId, "교육 수료증 제출")
                .orElseThrow(() -> new IllegalArgumentException("교육 수료증 제출 단계를 찾을 수 없습니다."));

        if (educationCertStep.getStatus() != AdoptionStepStatus.SUBMITTED &&
            educationCertStep.getStatus() != AdoptionStepStatus.REJECTED) { // 제출된 상태이거나 반려된 상태에서만 인증/반려 가능
            throw new IllegalStateException("교육 수료증 제출 단계가 현재 '제출 완료' 또는 '반려' 상태가 아닙니다.");
        }

        if (isVerified) {
            educationCertStep.setStatus(AdoptionStepStatus.COMPLETED);
            educationCertStep.setCompletedAt(LocalDateTime.now());
            // TODO: 다음 단계 활성화 로직 필요
        } else {
            educationCertStep.setStatus(AdoptionStepStatus.REJECTED);
            // TODO: 반려 사유 저장 로직 필요
        }
        adoptionStepInstanceRepository.save(educationCertStep);
    }

    private AdoptionEducationCertResponse mapAdoptionEducationCertToResponse(AdoptionEducationCert educationCert) {
        AdoptionEducationCertResponse response = new AdoptionEducationCertResponse();
        response.setId(educationCert.getId());
        response.setStepInstanceId(educationCert.getStepInstance().getId());
        response.setEducationInstitution(educationCert.getEducationInstitution());
        response.setCertificateNumber(educationCert.getCertificateNumber());
        response.setCompletionDate(educationCert.getCompletionDate());
        response.setCertificateFileUrl(educationCert.getCertificateFileUrl());
        return response;
    }
}
