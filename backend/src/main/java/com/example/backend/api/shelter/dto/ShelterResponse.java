package com.example.backend.api.shelter.dto;

import com.example.backend.domain.shelter.Shelter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShelterResponse {
    private Long id;
    private String careNm;
    private String shelterRegNo;
    private String tel;
    private String address;

    public ShelterResponse(Shelter shelter) {
        this.id = shelter.getId();
        this.careNm = shelter.getCareNm();
        this.shelterRegNo = shelter.getShelterRegNo();
        this.tel = shelter.getTel();
        this.address = shelter.getAddress();
    }
}
