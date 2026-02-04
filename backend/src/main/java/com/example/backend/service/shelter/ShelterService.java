package com.example.backend.service.shelter;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.api.dog.dto.DogUpdateRequest;
import com.example.backend.api.shelter.dto.ShelterResponse;
import com.example.backend.api.shelter.dto.ShelterUpdateRequest;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShelterService {

    private final ShelterRepository shelterRepository;
    private final AbandonedDogRepository abandonedDogRepository;
    private final ShelterPermissionEvaluator shelterPermissionEvaluator;

    /**
     * 특정 보호소에 보관중인 유기견 목록을 상태 필터링과 함께 페이지네이션하여 조회합니다.
     * @param shelterId 보호소의 고유 ID
     * @param processState 검색할 상태 (예: '보호중', '공고중') (선택 사항)
     * @param pageable 페이지 요청 정보 (page, size, sort)
     * @return Page<DogSummaryResponse>
     */
    public Page<DogSummaryResponse> getDogsByShelter(Long shelterId, String processState, Pageable pageable) {
        // 1. 요청한 shelterId에 대한 권한이 있는지 확인
        shelterPermissionEvaluator.checkShelterOwnership(shelterId);

        List<AbandonedDog> dogs;
        if (StringUtils.hasText(processState)) {
            dogs = abandonedDogRepository.findByShelter_IdAndProcessState(shelterId, processState);
        } else {
            dogs = abandonedDogRepository.findByShelter_Id(shelterId);
        }

        // List를 Page로 변환
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), dogs.size());
        List<DogSummaryResponse> dtoList = dogs.subList(start, end).stream()
                .map(DogSummaryResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(dtoList, pageable, dogs.size());
    }

    /**
     * 특정 보호소의 유기견 정보를 수정합니다.
     * @param shelterId 수정 권한을 확인할 보호소 ID
     * @param dogId 수정할 유기견의 ID
     * @param request 수정할 정보가 담긴 DTO
     * @return 수정된 유기견의 상세 정보
     */
    @Transactional
    public DogDetailResponse updateDogInShelter(Long shelterId, Long dogId, DogUpdateRequest request) {
                // 권한 검사
                shelterPermissionEvaluator.checkShelterOwnership(shelterId);
                AbandonedDog dog = abandonedDogRepository.findById(dogId)
                        .orElseThrow(() -> new IllegalArgumentException("ID: " + dogId + " 에 해당하는 유기견을 찾을 수 없습니다."));
                shelterPermissionEvaluator.checkShelterPermission(dog);
        dog.setHappenDt(request.getHappenDt());
        dog.setHappenPlace(request.getHappenPlace());
        dog.setKindNm(request.getKindNm());
        dog.setColorCd(request.getColorCd());
        dog.setAge(request.getAge());
        dog.setWeight(request.getWeight());
        dog.setNoticeNo(request.getNoticeNo());
        dog.setNoticeSdt(request.getNoticeSdt());
        dog.setNoticeEdt(request.getNoticeEdt());
        dog.setPopfile1(request.getPopfile1());
        dog.setPopfile2(request.getPopfile2());
        dog.setProcessState(request.getProcessState());
        dog.setSexCd(request.getSexCd());
        dog.setNeuterYn(request.getNeuterYn());
        dog.setSpecialMark(request.getSpecialMark());
        dog.setCareNm(request.getCareNm());
        dog.setCareTel(request.getCareTel());
        dog.setCareAddr(request.getCareAddr());
        dog.setOrgNm(request.getOrgNm());

        AbandonedDog updatedDog = abandonedDogRepository.save(dog);
        return DogDetailResponse.fromEntity(updatedDog, true); // 쉘터에선 수정 요망 or
    }

    /**
     * 특정 보호소의 유기견 정보를 삭제합니다.
     * @param shelterId 삭제 권한을 확인할 보호소 ID
     * @param dogId 삭제할 유기견의 ID
     */
    @Transactional
    public void deleteDogInShelter(Long shelterId, Long dogId) {
        // 권한 검사
        shelterPermissionEvaluator.checkShelterOwnership(shelterId);
        AbandonedDog dog = abandonedDogRepository.findById(dogId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + dogId + " 에 해당하는 유기견을 찾을 수 없습니다."));
        shelterPermissionEvaluator.checkShelterPermission(dog);

        abandonedDogRepository.delete(dog);
    }

    /**
     * 현재 로그인된 보호소 계정의 정보를 조회합니다.
     * @return 로그인된 보호소의 ShelterResponse DTO
     */
    public ShelterResponse getLoggedInShelterInfo() {
        Shelter shelter = shelterPermissionEvaluator.getLoggedInShelter();
        return new ShelterResponse(shelter);
    }

    /**
     * 현재 로그인된 보호소 계정의 정보를 수정합니다.
     * @param request 수정할 정보가 담긴 DTO
     * @return 수정된 보호소의 ShelterResponse DTO
     */
    @Transactional
    public ShelterResponse updateShelterInfo(ShelterUpdateRequest request) {
        Shelter shelter = shelterPermissionEvaluator.getLoggedInShelter();

        // DTO의 정보로 보호소 정보 업데이트
        if (request.getCareNm() != null) {
            shelter.setCareNm(request.getCareNm());
        }
        if (request.getTel() != null) {
            shelter.setTel(request.getTel());
        }
        if (request.getAddress() != null) {
            shelter.setAddress(request.getAddress());
        }
        // shelterRegNo는 고유값이므로 수정하지 않음

        Shelter updatedShelter = shelterRepository.save(shelter);
        return new ShelterResponse(updatedShelter);
    }

}
