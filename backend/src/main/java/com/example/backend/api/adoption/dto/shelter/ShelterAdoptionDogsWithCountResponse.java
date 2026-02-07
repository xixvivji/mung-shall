package com.example.backend.api.adoption.dto.shelter;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
public class ShelterAdoptionDogsWithCountResponse {
    private List<ShelterAdoptionDogResponse> dogsWithAdoption;
    private long totalCount;
}
