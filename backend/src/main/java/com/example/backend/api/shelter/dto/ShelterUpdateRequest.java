package com.example.backend.api.shelter.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShelterUpdateRequest {
    private String careNm;
    private String tel;
    private String address;
}
