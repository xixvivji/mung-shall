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
public class CurrentPetDetail {

    @Column(nullable = false)
    private String petType; // e.g., Dog, Cat, etc.

    @Column(nullable = false)
    private String breed;

    private Integer count; // Number of this type/breed of pet
    private Integer age;
    private Boolean neutered; // 중성화 여부

    @Column(columnDefinition = "TEXT")
    private String reasonForAdoptingMore; // 추가적으로 반려동물 입양하려는 이유
}
