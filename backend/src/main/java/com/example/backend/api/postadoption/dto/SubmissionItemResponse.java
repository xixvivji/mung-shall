package com.example.backend.api.postadoption.dto;

import com.example.backend.domain.postadoption.enums.SubmissionType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SubmissionItemResponse {
    private String submissionName;
    private String description;
    private boolean submitted;
    private boolean required; // From SubmissionDef
    private SubmissionType type;
    private String fileUrl;
    private String originalFileName;
    private PostAdoptionStepCategory category; // To categorize
}
