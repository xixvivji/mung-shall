package com.example.backend.api.postadoption.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ChecklistItemResponse {
    private Long id;
    private String itemText;
    private boolean checked;
    private boolean required; // From ChecklistItemDef
    private PostAdoptionStepCategory category; // To categorize
}
