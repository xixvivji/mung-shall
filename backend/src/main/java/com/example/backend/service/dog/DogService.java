package com.example.backend.service.dog;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogImageResponse;
import com.example.backend.api.dog.dto.DogStatusCountResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.DogAdoptionStatus;
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
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.Optional;
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

        User user = (userId != null) ? userRepository.findById(userId).orElse(null) : null;

        return dogPage.map(dog -> {
            DogSummaryResponse dto = DogSummaryResponse.fromEntity(dog);
            if (user != null) {
                dto.setLiked(userDogInterestRepository.existsByUserAndAbandonedDog(user, dog));
            }
            dto.setAdoptionStatus(determineAdoptionStatus(dog, userId));
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
        if (userId != null) {
            isLiked = userRepository.findById(userId)
                    .map(user -> userDogInterestRepository.existsByUserAndAbandonedDog(user, dog))
                    .orElse(false);
        }

        DogAdoptionStatus adoptionStatus = determineAdoptionStatus(dog, userId);
        return DogDetailResponse.fromEntity(dog, isLiked, adoptionStatus);
    }

    public List<DogSummaryResponse> getDogSummariesByIds(List<Long> dogIds, Long userId) {
        if (dogIds == null || dogIds.isEmpty()) {
            return List.of();
        }

        List<AbandonedDog> dogs = abandonedDogRepository.findAllById(dogIds);
        Map<Long, AbandonedDog> dogById = dogs.stream()
                .collect(Collectors.toMap(AbandonedDog::getId, Function.identity()));

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Invalid user"));
        }

        User finalUser = user;
        return dogIds.stream()
                .map(dogById::get)
                .filter(Objects::nonNull)
                .map(dog -> {
                    DogSummaryResponse dto = DogSummaryResponse.fromEntity(dog);
                    if (finalUser != null) {
                        dto.setLiked(userDogInterestRepository.existsByUserAndAbandonedDog(finalUser, dog));
                    }
                    dto.setAdoptionStatus(determineAdoptionStatus(dog, userId));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public DogAdoptionStatus determineAdoptionStatus(AbandonedDog dog, Long userId) {
        // 1. "종료(입양)" 상태 확인 (공공 API 데이터)
        if ("종료(입양)".equals(dog.getProcessState())) {
            return DogAdoptionStatus.ADOPTED;
        }

        // 2. 내부 시스템에서 "COMPLETED" 상태 확인
        if (adoptionRepository.existsByAbandonedDogAndProcessStatus(dog, AdoptionProcessStatus.COMPLETED)) {
            return DogAdoptionStatus.ADOPTED;
        }

        // 3. "진행 중"인 입양 절차 확인
        Optional<Adoption> inProgressAdoption = adoptionRepository.findByAbandonedDogAndProcessStatus(dog, AdoptionProcessStatus.IN_PROGRESS);

        if (inProgressAdoption.isPresent()) {
            Adoption adoption = inProgressAdoption.get();
            // 4. 로그인 사용자가 입양 진행 중인지 확인
            if (userId != null && adoption.getUser().getUserId().equals(userId)) {
                return DogAdoptionStatus.ADOPTING_BY_ME;
            } else {
                // 5. 다른 사용자가 입양 진행 중
                return DogAdoptionStatus.ADOPTING_BY_OTHERS;
            }
        }

        // 6. 아무도 입양 진행/완료하지 않은 상태
        return DogAdoptionStatus.NOT_ADOPTED;
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

    /**
     * 랜덤한 강아지 이미지 URL을 반환합니다.
     * @param limit 반환할 이미지의 개수
     * @return List<DogImageResponse> 강아지 이미지 목록
     */
    public List<DogImageResponse> getDogImages(int limit) {
        List<AbandonedDog> randomDogs = abandonedDogRepository.findRandomDogs(limit);

        return randomDogs.stream()
                .map(DogImageResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
