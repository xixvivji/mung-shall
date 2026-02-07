package com.example.backend.api.region.dto;

import com.example.backend.domain.region.Sigungu;
import lombok.Getter;

@Getter
public class SigunguResponse {
    private final String orgCd;
    private final String name;

    public SigunguResponse(Sigungu sigungu) {
        this.orgCd = sigungu.getOrgCd();
        this.name = sigungu.getName();
    }
}
