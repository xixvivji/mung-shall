package com.example.backend.service.dog;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogStatusCountResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.DogKind;
import com.example.backend.domain.user.User;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.dog.AbandonedDogSpecification;
import com.example.backend.repository.dog.DogKindRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.dog.interest.UserDogInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DogService {

    private final AbandonedDogRepository abandonedDogRepository;
    private final DogKindRepository dogKindRepository;
    private final UserRepository userRepository;
    private final UserDogInterestRepository userDogInterestRepository;
    private final AdoptionRepository adoptionRepository;

    /**
     * 유기견 목록을 페이지네이션과 동적 필터링으로 조회합니다.
     * @param region 검색할 지역명 (선택 사항)
     * @param sexCd 검색할 성별 코드 (선택 사항)
     * @param processState 검색할 상태 (선택 사항)
     * @param pageable 페이지 요청 정보 (page, size, sort)
     * @return Page<DogSummaryResponse>
     */
    public Page<DogSummaryResponse> getDogs(String region, String kindNm, String sexCd, String processState, Pageable pageable, Long userId) {
        // Specification으로 동적 쿼리 생성
        Specification<AbandonedDog> spec = AbandonedDogSpecification.createSpecification(region, kindNm, sexCd, processState);

        Page<AbandonedDog> dogPage = abandonedDogRepository.findAll(spec, pageable);

        // 🔹 비로그인
        if (userId == null) {
            return dogPage.map(DogSummaryResponse::fromEntity);
        }

        // 🔹 로그인
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalStateException("유효하지 않은 사용자"));

        return dogPage.map(dog -> {
            DogSummaryResponse dto = DogSummaryResponse.fromEntity(dog);
            dto.setLiked(
                    userDogInterestRepository.existsByUserAndAbandonedDog(user, dog)
            );
            dto.setAdopting(
                    adoptionRepository.existsByUserAndAbandonedDogAndProcessStatus(
                            user, dog, AdoptionProcessStatus.IN_PROGRESS
                    )
            );
            return dto;
        });
    }

    /**
     * 특정 ID의 유기견 상세 정보를 조회합니다.
     * @param id 유기견의 고유 ID
     * @return DogDetailResponse
     * @throws IllegalArgumentException 해당 ID의 유기견을 찾을 수 없을 경우
     */
    public DogDetailResponse getDogDetail(Long id, Long userId) {
        AbandonedDog dog = abandonedDogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + id + " 에 해당하는 유기견을 찾을 수 없습니다."));

        boolean isLiked = false;
        boolean isAdopting = false;
        if (userId != null) {
            isLiked = userRepository.findById(userId)
                    .map(user -> userDogInterestRepository.existsByUserAndAbandonedDog(user, dog))
                    .orElse(false);
            isAdopting = userRepository.findById(userId)
                    .map(user -> adoptionRepository.existsByUserAndAbandonedDogAndProcessStatus(user, dog, AdoptionProcessStatus.IN_PROGRESS))
                    .orElse(false);
        }

        return DogDetailResponse.fromEntity(dog, isLiked, isAdopting);
    }

    public List<String> getAllDogKinds() {
        return dogKindRepository.findAll().stream()
                .map(DogKind::getName)
                .collect(Collectors.toList());
    }

    /**
     * 각 유기견 상태별 개수를 조회합니다.
     * @return List<DogStatusCountResponse> 각 상태별 개수 목록
     */
    public List<DogStatusCountResponse> getDogStatusCounts() {
        List<Object[]> results = abandonedDogRepository.countDogsByProcessState();
        return results.stream()
                .map(result -> DogStatusCountResponse.builder()
                        .status((String) result[0])
                        .count((Long) result[1])
                        .build())
                .collect(Collectors.toList());
    }
}
