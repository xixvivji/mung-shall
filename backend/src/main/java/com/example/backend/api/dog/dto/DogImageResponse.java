package com.example.backend.api.dog.dto;

import com.example.backend.domain.dog.AbandonedDog;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
public class DogImageResponse {
    private Long id;
    private List<String> imageUrls;

    public static DogImageResponse fromEntity(AbandonedDog dog) {
        List<String> imageUrls = Arrays.asList(dog.getPopfile1())
                .stream()
                .filter(file -> file != null && !file.isEmpty())
                .collect(Collectors.toList());

        return DogImageResponse.builder()
                .id(dog.getId())
                .imageUrls(imageUrls)
                .build();
    }
}