package com.example.backend.domain.postadoption.embed;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDef {
    @Column(nullable = false)
    private String itemText;
    private boolean required; // 필수 체크 항목인지
}
