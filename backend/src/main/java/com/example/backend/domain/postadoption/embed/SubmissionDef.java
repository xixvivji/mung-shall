package com.example.backend.domain.postadoption.embed;

import com.example.backend.domain.postadoption.enums.SubmissionType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionDef {
    @Column(nullable = false)
    private String submissionName; // 예: 집 도착 사진 업로드
    @Column(columnDefinition = "TEXT")
    private String description;
    private boolean required; // 필수 제출 항목인지

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionType type; // 이미지, 문서 등
}
