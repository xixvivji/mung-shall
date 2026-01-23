package com.example.backend.service;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.repository.AbandonedDogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DogService {

    private final AbandonedDogRepository abandonedDogRepository;

    /**
     * 유기견 목록을 페이지네이션으로 조회합니다.
     * @param pageable 페이지 요청 정보 (page, size, sort)
     * @return Page<DogSummaryResponse>
     */
    public Page<DogSummaryResponse> getDogs(Pageable pageable) {
        // 1. DB에서 AbandonedDog 페이지를 조회합니다.
        Page<AbandonedDog> dogPage = abandonedDogRepository.findAll(pageable);

        // 2. 조회된 AbandonedDog 페이지를 DogSummaryResponse DTO 페이지로 변환합니다.
        return dogPage.map(DogSummaryResponse::fromEntity);
    }

    /**
     * 특정 ID의 유기견 상세 정보를 조회합니다.
     * @param id 유기견의 고유 ID
     * @return DogDetailResponse
     * @throws IllegalArgumentException 해당 ID의 유기견을 찾을 수 없을 경우
     */
    public DogDetailResponse getDogDetail(Long id) {
        AbandonedDog dog = abandonedDogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + id + " 에 해당하는 유기견을 찾을 수 없습니다."));
        return DogDetailResponse.fromEntity(dog);
    }
}
