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
public class CohabitantDetail {

    @Column(nullable = false)
    private String relationship; // 동거인과의 관계

    @Column(nullable = false)
    private Integer age; // 동거인 나이

    @Column(nullable = false)
    private Boolean hasAllergy; // 동물에 대한 알레르기 증상 유무
}