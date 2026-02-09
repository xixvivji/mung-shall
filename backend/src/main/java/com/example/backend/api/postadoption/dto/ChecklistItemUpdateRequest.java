package com.example.backend.api.postadoption.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChecklistItemUpdateRequest {
    @NotNull(message = "체크리스트 항목 ID는 null일 수 없습니다.")
    private Long checklistItemId;

    @NotNull(message = "체크 상태는 null일 수 없습니다.")
    private Boolean checked;
}
