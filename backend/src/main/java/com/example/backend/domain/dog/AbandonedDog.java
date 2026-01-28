package com.example.backend.domain.dog;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "abandoned_dog")
@Getter
@Setter
@NoArgsConstructor
public class AbandonedDog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String desertionNo; // 유기번호 (고유키)

    private String happenDt; // 접수일
    private String happenPlace; // 발견장소

    private String kindCd; // 품종코드
    private String kindNm; // 품종명

    private String colorCd; // 색상
    private String age; // 나이
    private String weight; // 체중

    private String noticeNo; // 공고번호
    private String noticeSdt; // 공고시작일
    private String noticeEdt; // 공고종료일

    @Column(length = 1024)
    private String popfile1; // 이미지1
    @Column(length = 1024)
    private String popfile2; // 이미지2

    private String processState; // 상태
    private String sexCd; // 성별
    private String neuterYn; // 중성화여부

    @Column(length = 2048)
    private String specialMark; // 특징

    private String careRegNo; // 보호소 등록번호
    private String careNm; // 보호소이름
    private String careTel; // 보호소전화번호
    @Column(length = 1024)
    private String careAddr; // 보호소주소
    private String careOwnerNm; // 보호소 소유주 이름

    private String orgNm; // 관할기관

    private String updTm; // 정보 수정 시간
}
