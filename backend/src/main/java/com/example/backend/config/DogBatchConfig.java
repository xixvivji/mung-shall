package com.example.backend.config;

import com.example.backend.api.dog.dto.PublicApiResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.DogKind;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.dog.DogKindRepository;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DogBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    private final AbandonedDogRepository abandonedDogRepository;
    private final ShelterRepository shelterRepository;
    private final DogKindRepository dogKindRepository;

    private final RestTemplate restTemplate;

    @Value("${api.abandoned-dog.url}")
    private String apiUrl;

    @Value("${api.abandoned-dog.serviceKey}")
    private String serviceKey;

    @Value("${api.abandoned-dog.upkind}")
    private String upkind;

    @Value("${api.abandoned-dog.numOfRows}")
    private int numOfRows;

    @Bean
    public Job updateDogDataJob() {
        return new JobBuilder("updateDogDataJob", jobRepository)
                .start(fetchAndSaveDogStep())
                .build();
    }

    @Bean
    public Step fetchAndSaveDogStep() {
        int chunkSize = 50;
        return new StepBuilder("fetchAndSaveDogStep", jobRepository)
                .<PublicApiResponse.Item, AbandonedDog>chunk(chunkSize, transactionManager)
                .reader(publicApiItemReader())
                .processor(dogItemProcessor())
                .writer(dogItemWriter())
                .build();
    }

    @Bean
    public ItemReader<PublicApiResponse.Item> publicApiItemReader() {
        return new ItemReader<>() {
            private List<PublicApiResponse.Item> items;
            private int nextIndex = 0;

            @Override
            public PublicApiResponse.Item read() {
                if (items == null) {
                    log.info("[Batch] 공공데이터 API 전체 수집 시작...");
                    items = fetchDogsFromApi();
                    log.info("[Batch] 수집 완료. 총 {}건 처리 대기 중.", items.size());

                    // ✅ 품종 업데이트는 수집 직후 1회
                    updateDogKinds(items);
                }

                if (nextIndex < items.size()) {
                    return items.get(nextIndex++);
                }
                return null;
            }
        };
    }

    /**
     * Processor: 중복 제거 + 엔티티 매핑
     * - 매 item마다 existsByDesertionNo() 호출 X
     * - 최초 1회 findAllDesertionNos()로 Set 로딩 후 contains 체크
     */
    @Bean
    public ItemProcessor<PublicApiResponse.Item, AbandonedDog> dogItemProcessor() {
        return new ItemProcessor<>() {
            private Set<String> existingDogIds;

            @Override
            public AbandonedDog process(PublicApiResponse.Item item) {
                if (existingDogIds == null) {
                    List<String> ids = abandonedDogRepository.findAllDesertionNos();
                    existingDogIds = new HashSet<>(ids);
                    log.info("[Batch] 기존 desertionNo {}건 로딩 완료", existingDogIds.size());
                }

                String desertionNo = item.getDesertionNo();
                if (desertionNo == null || desertionNo.isBlank()) return null;

                // 이미 존재하면 스킵
                if (existingDogIds.contains(desertionNo)) return null;

                // 이번 런에서 중복 방지
                existingDogIds.add(desertionNo);

                return mapItemToAbandonedDog(item);
            }
        };
    }

    @Bean
    public ItemWriter<AbandonedDog> dogItemWriter() {
        return items -> {
            if (items == null || items.isEmpty()) return;
            abandonedDogRepository.saveAll(items);
            log.info("💾 [Batch] 신규 유기견 {} 마리 저장 완료", items.size());
        };
    }

    // ------------------------------
    // 아래는 기존 코드 유지 + 안정성만 조금 보강
    // ------------------------------

    private List<PublicApiResponse.Item> fetchDogsFromApi() {
        int pageNo = 1;
        List<PublicApiResponse.Item> allItems = new ArrayList<>();

        PublicApiResponse firstResponse = callApi(pageNo);
        if (firstResponse == null || firstResponse.getResponse() == null || firstResponse.getResponse().getBody() == null) {
            log.warn("[Batch] API 첫 페이지 응답이 비어있습니다.");
            return allItems;
        }

        int totalCount = firstResponse.getResponse().getBody().getTotalCount();
        if (totalCount == 0) return allItems;

        List<PublicApiResponse.Item> firstItems = Optional.ofNullable(firstResponse.getResponse().getBody().getItems())
                .map(PublicApiResponse.Items::getItem)
                .orElse(Collections.emptyList());
        allItems.addAll(firstItems);

        int totalPages = (int) Math.ceil((double) totalCount / numOfRows);

        for (pageNo = 2; pageNo <= totalPages; pageNo++) {
            PublicApiResponse response = callApi(pageNo);
            if (response == null || response.getResponse() == null || response.getResponse().getBody() == null) continue;

            List<PublicApiResponse.Item> items = Optional.ofNullable(response.getResponse().getBody().getItems())
                    .map(PublicApiResponse.Items::getItem)
                    .orElse(Collections.emptyList());
            allItems.addAll(items);
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

        return restTemplate.getForObject(uri, PublicApiResponse.class);
    }

    private void updateDogKinds(List<PublicApiResponse.Item> items) {
        Set<String> uniqueKindNames = items.stream()
                .map(PublicApiResponse.Item::getKindNm)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (uniqueKindNames.isEmpty()) return;

        Set<String> existing = new HashSet<>(dogKindRepository.findAllNames());

        List<DogKind> toInsert = uniqueKindNames.stream()
                .filter(name -> !existing.contains(name))
                .map(DogKind::new) // DogKind(name) 생성자 이미 사용 중이었지
                .toList();

        if (!toInsert.isEmpty()) {
            dogKindRepository.saveAll(toInsert);
        }

        log.info("[Batch] DogKind 업데이트 완료. 신규 품종 {}개", toInsert.size());
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
        dog.setCareNm(item.getCareNm());
        dog.setCareTel(item.getCareTel());
        dog.setCareAddr(item.getCareAddr());
        dog.setOrgNm(item.getOrgNm());
        dog.setCareRegNo(item.getCareRegNo());
        dog.setCareOwnerNm(item.getCareOwnerNm());
        dog.setUpdTm(item.getUpdTm());

        String careNm = item.getCareNm();
        String careAddr = item.getCareAddr();

        Shelter shelter = shelterRepository.findByCareNmAndAddress(careNm, careAddr)
                .orElseGet(() -> shelterRepository.save(Shelter.builder()
                        .careNm(careNm)
                        .address(careAddr)
                        .tel(item.getCareTel())
                        .shelterRegNo(item.getCareRegNo())
                        .build()));

        dog.setShelter(shelter);
        return dog;
    }
}
