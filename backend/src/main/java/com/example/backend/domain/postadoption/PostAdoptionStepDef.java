package com.example.backend.domain.postadoption;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
}
