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
public class ChecklistItemInstance {
    @Column(nullable = false)
    private String itemText;
    private boolean checked; // 체크 여부
}
