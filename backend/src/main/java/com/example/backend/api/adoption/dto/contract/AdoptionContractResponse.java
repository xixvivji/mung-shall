package com.example.backend.api.adoption.dto.contract;

import com.example.backend.domain.adoption.step.contract.AdoptionContract;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionContractResponse {
    private Long id;
    private Long stepInstanceId;
    private String contractFileUrl;
    private String originalFileName;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public static AdoptionContractResponse fromEntity(AdoptionContract adoptionContract) {
        AdoptionContractResponse response = new AdoptionContractResponse();
        response.setId(adoptionContract.getId());
        response.setStepInstanceId(adoptionContract.getStepInstance().getId());
        response.setContractFileUrl(adoptionContract.getContractFileUrl());
        response.setOriginalFileName(adoptionContract.getOriginalFileName());
        response.setFileSize(adoptionContract.getFileSize());
        response.setUploadedAt(adoptionContract.getUploadedAt());
        return response;
    }
}
