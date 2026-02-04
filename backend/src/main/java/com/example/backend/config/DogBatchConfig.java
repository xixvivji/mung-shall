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
                    FetchResult fetch = fetchDogsFromApi();
                    items = fetch.items();
                    log.info("[Batch] 수집 완료. totalCount={}, totalPages={}, collectedItems={}",
                            fetch.totalCount(), fetch.totalPages(), items.size());

                    // 수집 직후 1회 품종 업데이트
                    updateDogKinds(items);
                }

                if (nextIndex < items.size()) return items.get(nextIndex++);
                return null;
            }
        };
    }

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
    // API Fetch
    // ------------------------------
    private FetchResult fetchDogsFromApi() {
        int pageNo = 1;
        List<PublicApiResponse.Item> allItems = new ArrayList<>();

        PublicApiResponse first = callApi(pageNo);
        if (first == null || first.getResponse() == null || first.getResponse().getBody() == null) {
            log.warn("[Batch] API 첫 페이지 응답이 비어있습니다.");
            return new FetchResult(0, 0, allItems);
        }

        int totalCount = first.getResponse().getBody().getTotalCount();
        if (totalCount == 0) return new FetchResult(0, 0, allItems);

        List<PublicApiResponse.Item> firstItems =
                Optional.ofNullable(first.getResponse().getBody().getItems())
                        .map(PublicApiResponse.Items::getItem)
                        .orElse(Collections.emptyList());

        allItems.addAll(firstItems);

        int totalPages = (int) Math.ceil((double) totalCount / numOfRows);

        // ✅ 운영 확인용 핵심 로그
        log.info("[Batch] totalCount={}, numOfRows={}, totalPages={}", totalCount, numOfRows, totalPages);

        for (pageNo = 2; pageNo <= totalPages; pageNo++) {
            PublicApiResponse resp = callApi(pageNo);
            if (resp == null || resp.getResponse() == null || resp.getResponse().getBody() == null) {
                log.warn("[Batch] page {} 응답이 비어있습니다. skip", pageNo);
                continue;
            }

            List<PublicApiResponse.Item> items =
                    Optional.ofNullable(resp.getResponse().getBody().getItems())
                            .map(PublicApiResponse.Items::getItem)
                            .orElse(Collections.emptyList());

            allItems.addAll(items);

            // 너무 시끄러우면 DEBUG로 낮춰도 됨
            log.info("[Batch] fetched page {}/{} (added={})", pageNo, totalPages, items.size());
        }

        return new FetchResult(totalCount, totalPages, allItems);
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

        if (uniqueKindNames.isEmpty()) {
            log.info("[Batch] DogKind 업데이트 스킵 (품종 없음)");
            return;
        }

        Set<String> existing = new HashSet<>(dogKindRepository.findAllNames());

        List<DogKind> toInsert = uniqueKindNames.stream()
                .filter(name -> !existing.contains(name))
                .map(DogKind::new)
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

        // ⚠️ 동시성 중복 삽입 가능성: (careNm, address) 유니크 제약이 가장 확실한 해결
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

    private record FetchResult(int totalCount, int totalPages, List<PublicApiResponse.Item> items) {}
}
