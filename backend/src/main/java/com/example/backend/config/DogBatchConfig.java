package com.example.backend.config;

import com.example.backend.api.dog.dto.PublicApiResponse;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.DogKind;
import com.example.backend.domain.dog.personality.DogPersonality;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.dog.DogKindRepository;
import com.example.backend.repository.dog.personality.DogPersonalityRepository;
import com.example.backend.repository.shelter.ShelterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
    private final ShelterRepository shelterRepository;
    private final DogKindRepository dogKindRepository;
    private final DogPersonalityRepository dogPersonalityRepository;

    private final RestTemplate restTemplate;
    private final ChatClient.Builder chatClientBuilder;

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
        return new ItemReader<PublicApiResponse.Item>() {
            private List<PublicApiResponse.Item> items;
            private int nextIndex = 0;

            @Override
            public PublicApiResponse.Item read() {
                if (items == null) {
                    log.info("[Batch] 공공데이터 API 전체 수집 시작...");
                    items = fetchDogsFromApi();
                    log.info("[Batch] 수집 완료. 총 {}건 처리 대기 중. ", items.size());
                }

                if (nextIndex < items.size()) {
                    return items.get(nextIndex++);
                }
                return null; // 데이터 끝
            }
        };
    }

    // API 페이징 루프 로직
    private List<PublicApiResponse.Item> fetchDogsFromApi() {
        int pageNo = 1;
        List<PublicApiResponse.Item> allItems = new ArrayList<>();

        // 첫 페이지 호출
        PublicApiResponse firstResponse = callApi(pageNo);
        if(firstResponse == null || firstResponse.getResponse().getBody() == null) return allItems;

        int totalCount = firstResponse.getResponse().getBody().getTotalCount();
        if(totalCount == 0) return allItems;

        List<PublicApiResponse.Item> firstItems = firstResponse.getResponse().getBody().getItems().getItem();
        if(firstItems != null) allItems.addAll(firstItems);

        int totalPages = (int)Math.ceil((double)totalCount / numOfRows);

        // 나머지 페이지 호출
        for(pageNo = 2; pageNo <= totalPages; pageNo++) {
            PublicApiResponse response = callApi(pageNo);
            if(response != null && response.getResponse().getBody() != null && response.getResponse().getBody().getItems().getItem() != null) {
                allItems.addAll(response.getResponse().getBody().getItems().getItem());
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

        return restTemplate.getForObject(uri, PublicApiResponse.class);
    }

    // --- [2. Processor] DTO -> Entity 변환 + AI 분석 ---
    @Bean
    public ItemProcessor<PublicApiResponse.Item, AbandonedDog> dogItemProcessor() {
        return item -> {
            boolean exists = abandonedDogRepository.existsByDesertionNo(item.getDesertionNo());
            if(exists) return null;

            String kindNm = item.getKindNm();
            if(kindNm != null && !kindNm.trim().isEmpty()) {
                if(!dogKindRepository.existsByName(kindNm)) {
                    dogKindRepository.save(new DogKind(kindNm));
                }
            }

            AbandonedDog dog = mapItemToAbandonedDog(item);

            try {
                analyzePersonalityWithAI(dog, item.getSpecialMark());
            } catch(Exception e) {
                log.error("AI 분석 실패(유기번호: {}): {}", item.getDesertionNo(), e.getMessage());
            }

            return dog;
        };
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

    // AI가 유기견의 특징을 분석하여 강이지의 성향을 벡터화하여 채워넣음
    private void analyzePersonalityWithAI(AbandonedDog dog, String specialMark) {
        String info = String.format("품종:[%s], 나이:[%s], 체중:[%s], 성별:[%s], 특징:[%s]",
                dog.getKindNm(), dog.getAge(), dog.getWeight(), dog.getSexCd(), (specialMark != null ? specialMark: "정보 없음"));

        String promptText = """
                너는 유기견 보호소의 베테랑 행동 전문가야.
                아래 강아지의 기본 정보를 바탕으로 성향 점수(1~5)를 추론하고, 입양 희망자에게 보여줄 '따뜻한 관찰 코멘트'를 작성해줘.
                
                [강아지 정보]
                %s
                
                [추론 가이드]
                1. 특징 텍스트가 부족하면 '품종(Breed)'과 '나이(Age)'를 적극적으로 참고해라.
                   - 예: 1살 미만 -> 활동성(5), 분리불안(4) 높음
                   - 예: 노령견 -> 활동성(1~2) 낮음
                   - 예: 리트리버/보더콜리 -> 활동성(5), 친화력(5)
                2. 'aiObservation'은 2~3문장으로, "이 강아지는 ~한 특징이 있습니다. ~한 분께 추천해요!" 같은 느낌으로 작성해.
                
                [응답 JSON 필드]
                - activity (1~5): 활동 에너지
                - barking (1~5): 짖음 빈도
                - separationAnxiety (1~5): 분리불안 가능성
                - sheddingLevel (1~5): 털빠짐 정도
                - strangerFriendliness (1~5): 낯선 사람에 대한 친화력(경계심)
                - aiObservation: 전문가의 관찰 코멘트 (한국어)
                """.formatted(specialMark);

        DogPersonality personality = chatClientBuilder.build()
                .prompt()
                .user(promptText)
                .call()
                .entity(DogPersonality.class);

        if(personality != null) {
            personality.setAbandonedDog(dog);
            dogPersonalityRepository.save(personality);
            log.info("AI 추론 완료: {} -> {}", dog.getKindNm(), personality.getAiObservation());
        }
    }

    // --- [3. Writer] DB 저장 ---
    @Bean
    public ItemWriter<AbandonedDog> dogItemWriter() {
        return items -> {
            log.info("💾 [Batch] 신규 유기견 {} 마리 저장 완료", items.size());
            abandonedDogRepository.saveAll(items);

            // TODO: 추후 Redis 캐싱 로직 추가 (redisService.saveAll(items))
        };
    }
}