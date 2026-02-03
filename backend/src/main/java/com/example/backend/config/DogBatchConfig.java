package com.example.backend.config;

import com.example.backend.api.dog.dto.PublicApiResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.repository.dog.AbandonedDogRepository;
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
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DogBatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final AbandonedDogRepository abandonedDogRepository;

    @Value("${api.abandoned-dog.serviceKey}")
    private String serviceKey;

    @Value("${api.abandoned-dog.url}")
    private String apiUrl;

    @Bean
    public Job updateDogDataJob() {
        return new JobBuilder("updateDogDataJob", jobRepository)
                .start(fetchAndSaveDogStep())
                .build();
    }

    @Bean
    public Step fetchAndSaveDogStep() {
        // Chunk Size: 한 번에 처리할 데이터 양
        int chunkSize = 20;

        return new StepBuilder("fetchAndSaveDogStep", jobRepository)
                .<PublicApiResponse.Item, AbandonedDog>chunk(chunkSize, transactionManager)
                .reader(publicApiItemReader())      // 1. API 호출
                .processor(dogItemProcessor())      // 2. 변환 및 중복체크 (AI 분석 위치)
                .writer(dogItemWriter())            // 3. DB 저장
                .build();
    }

    @Bean
    public ItemReader<PublicApiResponse.Item> publicApiItemReader() {
        // 실제로는 페이징 처리가 필요하지만, 일단 오늘 날짜 기준 1회 호출로 가정
        // 데이터가 많다면 PaginationItemReader 등을 구현해야 함

        return new ItemReader<PublicApiResponse.Item>() {
            private boolean isRead = false; // 한 번만 읽도록 플래그 설정
            private List<PublicApiResponse.Item> items = null;
            private int nextIndex = 0;

            @Override
            public PublicApiResponse.Item read() {
                if (!isRead) {
                    items = fetchDogsFromApi();
                    isRead = true;
                }

                if (items != null && nextIndex < items.size()) {
                    return items.get(nextIndex++);
                }
                return null; // 데이터 끝
            }
        };
    }

    // 실제 API 호출 로직 (RestClient 사용)
    private List<PublicApiResponse.Item> fetchDogsFromApi() {
        try {
            // 날짜 범위 설정 (어제 ~ 오늘 데이터 갱신)
            String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String yesterday = LocalDate.now().minusDays(1).format(DateTimeFormatter.ofPattern("yyyyMMdd"));

            URI uri = UriComponentsBuilder.fromHttpUrl(apiUrl)
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("bgnde", yesterday) // 시작일
                    .queryParam("endde", today)     // 종료일
                    .queryParam("numOfRows", "100") // 한 번에 가져올 개수
                    .queryParam("_type", "json")    // JSON 요청
                    .build(true)
                    .toUri();

            log.info("📡 공공데이터 API 호출: {}", uri);

            PublicApiResponse response = RestClient.create().get()
                    .uri(uri)
                    .retrieve()
                    .body(PublicApiResponse.class);

            if (response != null && response.getResponse() != null
                    && response.getResponse().getBody() != null
                    && response.getResponse().getBody().getItems() != null) {

                return response.getResponse().getBody().getItems().getItem();
            }
        } catch (Exception e) {
            log.error("❌ API 호출 실패: {}", e.getMessage());
        }
        return Collections.emptyList();
    }


    // --- [2. Processor] DTO -> Entity 변환 ---
    @Bean
    public ItemProcessor<PublicApiResponse.Item, AbandonedDog> dogItemProcessor() {
        return item -> {
            // 1. 기존 데이터 확인 (중복 방지)
            Optional<AbandonedDog> existingDog = abandonedDogRepository.findByDesertionNo(item.getDesertionNo());

            AbandonedDog dog;
            if (existingDog.isPresent()) {
                // 이미 존재하면 업데이트 (상태 변경 등)
                dog = existingDog.get();
                log.debug("🔄 기존 강아지 업데이트: {}", item.getDesertionNo());
            } else {
                // 없으면 신규 생성
                dog = new AbandonedDog();
                dog.setDesertionNo(item.getDesertionNo());
                log.info("✨ 신규 강아지 발견: {}", item.getDesertionNo());

                // TODO: [AI 파트] 신규 강아지인 경우 여기서 Spring AI를 호출하여 성향 분석
                // analyzeAndSaveVector(dog, item.getSpecialMark());
            }

            // 필드 매핑 (Entity <-> DTO)
            mapDtoToEntity(dog, item);

            return dog;
        };
    }

    // DTO 데이터를 Entity로 매핑하는 헬퍼 메서드
    private void mapDtoToEntity(AbandonedDog dog, PublicApiResponse.Item item) {
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
        dog.setPopfile1(item.getPopfile1()); // image
        dog.setPopfile2(item.getPopfile2()); // thumbnail
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
    }


    // --- [3. Writer] DB 저장 ---
    @Bean
    public ItemWriter<AbandonedDog> dogItemWriter() {
        return items -> {
            log.info("💾 DB 저장 시작: {} 건", items.size());
            abandonedDogRepository.saveAll(items);

            // TODO: [Redis 파트] 저장된 강아지들의 성향 점수를 Redis에 캐싱
            // redisService.saveScores(items);
        };
    }
}