package com.example.backend.domain.adoption.embed;

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
public class CohabitantInfo {
    private String name;
    private String relation;
    private Boolean hasAllergy; // 동거인 구성원 중 동물에 대한 알레르기 증상은 없습니까?
}
