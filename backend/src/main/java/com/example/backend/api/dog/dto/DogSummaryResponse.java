package com.example.backend.api.dog.dto;

import com.example.backend.domain.dog.AbandonedDog;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DogSummaryResponse {

    private Long dogId;
    private String imageUrl;
    private String kindNm;
    private String age;
    private String weight;
    private String careNm;

    /**
     * AbandonedDog 엔티티를 DogSummaryResponse DTO로 변환하는 정적 팩토리 메소드
     * @param dog 변환할 AbandonedDog 엔티티
     * @return 변환된 DogSummaryResponse 객체
     */
    public static DogSummaryResponse fromEntity(AbandonedDog dog) {
        return new DogSummaryResponse(
                dog.getId(),
                dog.getPopfile1(), // 썸네일 이미지를 기본으로 사용
                dog.getKindNm(),
                dog.getAge(),
                dog.getWeight(),
                dog.getCareNm()
        );
    }
}
