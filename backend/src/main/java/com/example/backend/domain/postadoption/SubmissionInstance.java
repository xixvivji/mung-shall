package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import com.example.backend.domain.postadoption.enums.SubmissionType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "submission_instance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubmissionInstance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_instance_id", nullable = false)
    private PostAdoptionStepInstance postAdoptionStepInstance;

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

    public SubmissionInstance(PostAdoptionStepInstance postAdoptionStepInstance, String submissionName, String description, boolean submitted, SubmissionType type, String fileUrl, String originalFileName) {
        this.postAdoptionStepInstance = postAdoptionStepInstance;
        this.submissionName = submissionName;
        this.description = description;
        this.submitted = submitted;
        this.type = type;
        this.fileUrl = fileUrl;
        this.originalFileName = originalFileName;
    }
}
