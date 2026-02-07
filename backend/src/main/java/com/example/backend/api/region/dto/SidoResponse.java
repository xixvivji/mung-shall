package com.example.backend.api.region.dto;

import com.example.backend.domain.region.Sido;
import lombok.Getter;

@Getter
public class SidoResponse {
    private final String orgCd;
    private final String name;

    public SidoResponse(Sido sido) {
        this.orgCd = sido.getOrgCd();
        this.name = sido.getName();
    }
}
