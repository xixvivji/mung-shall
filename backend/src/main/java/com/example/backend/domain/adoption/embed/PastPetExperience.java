package com.example.backend.domain.adoption.embed;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class PastPetExperience {

    @Column(nullable = false)
    private String pastPetType; // 어떤 반려동물

    @Column(nullable = false)
    private Integer pastPetCount; // 몇 마리

    @Column(nullable = false)
    private String duration; // 얼마나 오래

    @Column(nullable = false)
    private Boolean isCurrentlyWithYou; // 현재 함께하고 있는지 여부

    @Column(columnDefinition = "TEXT")
    private String details; // 자세한 사항
}
