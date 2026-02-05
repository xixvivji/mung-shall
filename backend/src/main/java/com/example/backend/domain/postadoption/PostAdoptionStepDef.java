package com.example.backend.domain.postadoption;

import com.example.backend.domain.postadoption.embed.ChecklistItemDef;
import com.example.backend.domain.postadoption.embed.SubmissionDef;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "post_adoption_step_def")
@Getter
@Setter
@NoArgsConstructor
public class PostAdoptionStepDef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // 예: 1개월차 건강 확인

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_order", nullable = false)
    private Integer defaultOrder; // 표준적인 경우의 기본 순서

    @Column(nullable = false)
    private long daysAfterAdoption; // 입양 완료일로부터 며칠 후 이 단계가 시작되는지

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_adoption_checklist_def", joinColumns = @JoinColumn(name = "step_def_id"))
    private List<ChecklistItemDef> checklistDefs = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "post_adoption_submission_def", joinColumns = @JoinColumn(name = "step_def_id"))
    private List<SubmissionDef> submissionDefs = new ArrayList<>();
}
