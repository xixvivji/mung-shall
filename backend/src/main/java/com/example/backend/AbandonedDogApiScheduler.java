package com.example.backend;

import com.example.backend.api.dog.dto.PublicApiResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AbandonedDogApiScheduler {

    private final AbandonedDogRepository abandonedDogRepository;
    private final RestTemplate restTemplate;
    private final ShelterRepository shelterRepository; // Added injection

    @Value("${api.abandoned-dog.url}")
    private String apiUrl;

    @Value("${api.abandoned-dog.serviceKey}")
    private String serviceKey;

    @Value("${api.abandoned-dog.upkind}")
    private String upkind;

    @Value("${api.abandoned-dog.numOfRows}")
    private int numOfRows;

    @Scheduled(cron = "0 0 0 * * *") // 매일 00시에 실행
    @Transactional
    public void fetchAndSaveAbandonedDogs() {
        log.info("유기견 데이터 동기화 작업을 시작합니다.");
        try {
            // 1. API를 통해 모든 유기견 데이터를 가져옴
            List<PublicApiResponse.Item> allItems = fetchAllItemsFromApi();
            if (allItems.isEmpty()) {
                log.info("API로부터 가져온 새로운 유기견 데이터가 없습니다.");
                return;
            }

            // 2. API에서 가져온 모든 유기번호(desertionNo)를 추출
            Set<String> apiDogIds = allItems.stream()
                    .map(PublicApiResponse.Item::getDesertionNo)
                    .collect(Collectors.toSet());

            // 3. DB에서 이미 존재하는 유기번호를 단 한 번의 쿼리로 조회
            List<String> existingDogIds = abandonedDogRepository.findDesertionNosByDesertionNoIn(apiDogIds);
            Set<String> existingDogIdsSet = Set.copyOf(existingDogIds);

            // 4. 새로운 유기견 데이터만 필터링하여 엔티티로 변환
            List<AbandonedDog> dogsToSave = allItems.stream()
                    .filter(item -> !existingDogIdsSet.contains(item.getDesertionNo()))
                    .map(this::mapItemToAbandonedDog)
                    .collect(Collectors.toList());

            // 5. 새로운 데이터가 있을 경우, saveAll로 한 번에 저장
            if (!dogsToSave.isEmpty()) {
                abandonedDogRepository.saveAll(dogsToSave);
                log.info("유기견 데이터 동기화 작업 완료. 총 {}개의 데이터 중 {}개의 새로운 데이터를 추가했습니다.", allItems.size(), dogsToSave.size());
            } else {
                log.info("유기견 데이터 동기화 작업 완료. 새로운 데이터가 없습니다.");
            }

        } catch (Exception e) {
            log.error("유기견 데이터 동기화 중 오류 발생", e);
        }
    }

    private List<PublicApiResponse.Item> fetchAllItemsFromApi() {
        int pageNo = 1;
        int totalCount;
        int totalPages;
        List<PublicApiResponse.Item> allItems = new ArrayList<>();

        // 첫 페이지 호출
        PublicApiResponse firstResponse = callApi(pageNo);
        if (firstResponse == null || firstResponse.getResponse().getBody() == null) {
            log.warn("API 첫 페이지 응답이 비어있습니다.");
            return allItems;
        }

        totalCount = firstResponse.getResponse().getBody().getTotalCount();
        if (totalCount == 0) {
            return allItems;
        }

        List<PublicApiResponse.Item> firstItems = firstResponse.getResponse().getBody().getItems().getItem();
        if (firstItems != null) {
            allItems.addAll(firstItems);
        }

        totalPages = (int) Math.ceil((double) totalCount / numOfRows);
        log.info("총 데이터: {}, 총 페이지: {}", totalCount, totalPages);

        // 나머지 페이지 호출
        for (pageNo = 2; pageNo <= totalPages; pageNo++) {
            PublicApiResponse response = callApi(pageNo);
            if (response != null && response.getResponse().getBody() != null && response.getResponse().getBody().getItems().getItem() != null) {
                allItems.addAll(response.getResponse().getBody().getItems().getItem());
                log.info("지금 페이지: {}", pageNo);
            }
        }
        return allItems;
    }

    private PublicApiResponse callApi(int pageNo) {
        URI uri = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("serviceKey", serviceKey)
                .queryParam("upkind", upkind)
                .queryParam("numOfRows", numOfRows)
                .queryParam("pageNo", pageNo)
                .queryParam("_type", "json")
                .build(true)
                .toUri();

        log.debug("Calling API: {}", uri);
        return restTemplate.getForObject(uri, PublicApiResponse.class);
    }

    private AbandonedDog mapItemToAbandonedDog(PublicApiResponse.Item item) {
        AbandonedDog dog = new AbandonedDog();
        dog.setDesertionNo(item.getDesertionNo());
        dog.setHappenDt(item.getHappenDt());
        dog.setHappenPlace(item.getHappenPlace());
        dog.setKindCd(item.getKindCd());
        dog.setKindNm(item.getKindNm());
        dog.setColorCd(item.getColorCd());
        dog.setAge(item.getAge());
        dog.setWeight(item.getWeight());
        dog.setNoticeNo(item.getNoticeNo());
        dog.setNoticeSdt(item.getNoticeSdt());
        dog.setNoticeEdt(item.getNoticeEdt());
        dog.setPopfile1(item.getPopfile1());
        dog.setPopfile2(item.getPopfile2());
        dog.setProcessState(item.getProcessState());
        dog.setSexCd(item.getSexCd());
        dog.setNeuterYn(item.getNeuterYn());
        dog.setSpecialMark(item.getSpecialMark());

        // api 응답에 존재하지 않는 보호소 정보 있으면 db에 추가
        String careNm = item.getCareNm();
        String careAddr = item.getCareAddr();
        String careTel = item.getCareTel();
        String shelterRegNo = item.getCareRegNo();

        Shelter shelter = shelterRepository.findByCareNmAndAddress(careNm, careAddr)
                .orElseGet(() -> {
                    Shelter newShelter = Shelter.builder()
                            .careNm(careNm)
                            .address(careAddr)
                            .tel(careTel)
                            .shelterRegNo(shelterRegNo)
                            .user(null)
                            .build();
                    return shelterRepository.save(newShelter);
                });
        dog.setShelter(shelter);

        dog.setCareNm(item.getCareNm());
        dog.setCareTel(item.getCareTel());
        dog.setCareAddr(item.getCareAddr());
        dog.setOrgNm(item.getOrgNm());
        dog.setCareRegNo(item.getCareRegNo());
        dog.setCareOwnerNm(item.getCareOwnerNm());

        dog.setUpdTm(item.getUpdTm());
        return dog;
    }
}