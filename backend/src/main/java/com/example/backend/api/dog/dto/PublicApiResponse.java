package com.example.backend.api.dog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PublicApiResponse {
    private Response response;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Response {
        private Header header;
        private Body body;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Header {
        private String reqNo;
        private String resultCode;
        private String resultMsg;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Body {
        private Items items;
        private int numOfRows;
        private int pageNo;
        private int totalCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Items {
        private List<Item> item;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true) // 응답에서 domain에 없는 필드 무시
    public static class Item {
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
        private String careNm;
        private String careTel;
        private String careAddr;
        private String orgNm;
        private String careRegNo;
        private String careOwnerNm;
        private String updTm;
    }
}
