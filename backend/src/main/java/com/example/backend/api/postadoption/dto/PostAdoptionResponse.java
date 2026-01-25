package com.example.backend.api.postadoption.dto;

import com.example.backend.domain.postadoption.enums.PostAdoptionProcessStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class PostAdoptionResponse {
    private Long id;
    private Long adoptionId;
    private PostAdoptionProcessStatus processStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PostAdoptionStepResponse> steps;
}
