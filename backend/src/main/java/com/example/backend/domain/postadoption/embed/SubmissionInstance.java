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
public class SubmissionInstance {
    @Column(nullable = false)
    private String submissionName;
    @Column(columnDefinition = "TEXT")
    private String description;
    private boolean submitted; // 제출 여부

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionType type; // 이미지, 문서 등

    private String fileUrl; // 제출된 파일의 URL
    private String originalFileName; // 제출된 파일의 원본 이름
}
