package com.example.backend.service.shelter;

import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.dog.AbandonedDogSpecification;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShelterService {

    private final ShelterRepository shelterRepository;
    private final AbandonedDogRepository abandonedDogRepository;

    /**
     * 특정 보호소에 보관중인 유기견 목록을 상태 필터링과 함께 페이지네이션하여 조회합니다.
     * @param shelterId 보호소의 고유 ID
     * @param processState 검색할 상태 (예: '보호중', '공고중') (선택 사항)
     * @param pageable 페이지 요청 정보 (page, size, sort)
     * @return Page<DogSummaryResponse>
     */
    public Page<DogSummaryResponse> getDogsByShelter(Long shelterId, String processState, Pageable pageable) {
        // 1. 요청한 shelterId가 실제로 존재하는지 확인
        if (!shelterRepository.existsById(shelterId)) {
            throw new IllegalArgumentException("Invalid Shelter ID: " + shelterId);
        }

        // 2. Specification을 사용하여 동적 쿼리 생성
        Specification<AbandonedDog> spec = AbandonedDogSpecification.createSpecification(null, null, processState, shelterId);

        // 3. 동적 쿼리와 페이지 정보를 사용하여 DB에서 데이터 조회
        Page<AbandonedDog> dogPage = abandonedDogRepository.findAll(spec, pageable);

        // 4. 조회된 AbandonedDog 페이지를 DogSummaryResponse DTO 페이지로 변환
        return dogPage.map(DogSummaryResponse::fromEntity);
    }
}
