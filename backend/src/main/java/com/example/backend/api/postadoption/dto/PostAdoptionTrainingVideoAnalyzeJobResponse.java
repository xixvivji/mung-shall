package com.example.backend.api.postadoption.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostAdoptionTrainingVideoAnalyzeJobResponse {
    private String jobId;
    private String status;
    private String statusUrl;
    private String downloadUrl;
    private String error;
}
