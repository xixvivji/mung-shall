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
public class CurrentPetInfo {
    private String breed;       // 품종
    private Integer count;      // 마릿 수 (이 필드는 CurrentPetInfo가 한 마리 정보라면 필요없을 수 있습니다.)
                                // 하지만 사용자 요청에 "마릿 수"가 있어서 우선 포함합니다.
                                // 만약 CurrentPetInfo가 개별 반려동물이라면, count 대신 List<CurrentPetInfo>가 맞습니다.
                                // 일단은 요청사항에 맞춰 List에 각 객체에 이 count를 둡니다.
    private Integer age;        // 나이
    private Boolean isNeutered; // 중성화 여부
}
