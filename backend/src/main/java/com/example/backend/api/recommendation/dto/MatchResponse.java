package com.example.backend.api.recommendation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MatchResponse {

    private List<Item> items;

    @Getter
    @AllArgsConstructor
    public static class Item {
        private Long dogId;
        private double similarity;
    }

}
