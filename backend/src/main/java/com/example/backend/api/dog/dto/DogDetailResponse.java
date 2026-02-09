package com.example.backend.api.dog.dto;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.DogAdoptionStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DogDetailResponse {

    private Long id;
    private String desertionNo;
    private String happenDt;
    private String happenPlace;
    private String kindCd;
    private String kindNm;
    private String colorCd;
    private String age;
    private String weight;
    private String noticeNo;
    private String noticeSdt;
    private String noticeEdt;
    private String popfile1;
    private String popfile2;
    private String processState;
    private String sexCd;
    private String neuterYn;
    private String specialMark;
    private String careRegNo;
    private String careNm;
    private String careTel;
    private String careAddr;
    private String careOwnerNm;
    private String orgNm;
    private String updTm;
    private boolean isLiked;
    private DogAdoptionStatus adoptionStatus;

    public static DogDetailResponse fromEntity(AbandonedDog dog, boolean isLiked, DogAdoptionStatus adoptionStatus) {
        return new DogDetailResponse(
                dog.getId(),
                dog.getDesertionNo(),
                dog.getHappenDt(),
                dog.getHappenPlace(),
                dog.getKindCd(),
                dog.getKindNm(),
                dog.getColorCd(),
                dog.getAge(),
                dog.getWeight(),
                dog.getNoticeNo(),
                dog.getNoticeSdt(),
                dog.getNoticeEdt(),
                dog.getPopfile1(),
                dog.getPopfile2(),
                dog.getProcessState(),
                dog.getSexCd(),
                dog.getNeuterYn(),
                dog.getSpecialMark(),
                dog.getCareRegNo(),
                dog.getCareNm(),
                dog.getCareTel(),
                dog.getCareAddr(),
                dog.getCareOwnerNm(),
                dog.getOrgNm(),
                dog.getUpdTm(),
                isLiked,
                adoptionStatus
        );
    }
}
