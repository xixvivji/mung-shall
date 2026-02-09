package com.example.backend.api.dog.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DogUpdateRequest {
    private String happenDt;
    private String happenPlace;
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
    private String careNm;
    private String careTel;
    private String careAddr;
    private String orgNm;
}
