package com.example.backend.api.recommendation;

import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.api.recommendation.dto.*;
import com.example.backend.service.dog.DogService;
import com.example.backend.service.recommendation.DogRecommendationSurveyService;
import com.example.backend.service.recommendation.RecommendationAsyncService;
import com.example.backend.service.recommendation.cache.RecommendationCacheEntry;
import com.example.backend.service.recommendation.cache.RecommendationCacheService;
import com.example.backend.service.recommendation.cache.RecommendationMatch;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

// {userId}를 쿼리 파라미터로 쓰지 말고, 인증 정보로 가져오기 파라미터 없이
@Tag(name = "강아지 추천 설문 API", description = "유저의 강아지 추천 설문 CRUD API")
@RestController
@RequestMapping("/api/recommendation/survey")
@RequiredArgsConstructor
public class DogRecommendationSurveyController {

    private final DogRecommendationSurveyService dogRecommendationSurveyService;
    private final DogService dogService;
    private final RecommendationAsyncService recommendationAsyncService;
    private final RecommendationCacheService recommendationCacheService;

    @Operation(summary = "추천 리스트 조회", description = "요청한 유저의 설문을 기반으로 추천 리스트를 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "추천 조회 성공",
                    content = @Content(schema = @Schema(implementation = DogRecommendationsResponse.class))),
            @ApiResponse(responseCode = "401", description = "인증 필요"),
            @ApiResponse(responseCode = "403", description = "userId 불일치"),
            @ApiResponse(responseCode = "404", description = "설문이 없음")
    })
    @GetMapping("/recommendations/user/{userId}")
    public ResponseEntity<DogRecommendationsResponse> getRecommendations(
            @Parameter(description = "요청한 유저 ID") @PathVariable Long userId
    ) {
        DogRecommendationSurveyResponse survey = dogRecommendationSurveyService.getSurveyByUserId(userId);

        RecommendationCacheEntry cached = recommendationCacheService.get(userId);
        if (cached != null && isCacheFresh(cached, survey)) {
            List<RecommendedDogDto> recs = buildRecommendationsFromMatches(cached.matches(), survey.getUserId());
            return ResponseEntity.ok(new DogRecommendationsResponse(recs));
        }

        recommendationAsyncService.generateRecommendations(survey);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(new DogRecommendationsResponse(List.of()));
    }

    @Operation(summary = "강아지 추천 설문 생성", description = "유저의 강아지 추천 설문 응답을 생성합니다. 유저당 하나의 설문만 생성 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "설문 생성 성공",
                    content = @Content(schema = @Schema(implementation = DogRecommendationSurveyResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 이미 설문이 존재함, 유저 ID 없음)"),
            @ApiResponse(responseCode = "404", description = "유저를 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<DogSurveyWithRecommendationsResponse> createSurvey(
            @Valid @RequestBody DogRecommendationSurveyCreateRequest request
    ) {
        DogRecommendationSurveyResponse survey = dogRecommendationSurveyService.createSurvey(request);

        recommendationCacheService.evict(survey.getUserId());
        recommendationAsyncService.generateRecommendations(survey);

        DogSurveyWithRecommendationsResponse body =
                new DogSurveyWithRecommendationsResponse(survey, List.of());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @Operation(summary = "유저 ID로 강아지 추천 설문 조회", description = "특정 유저의 강아지 추천 설문 응답을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "설문 조회 성공",
                    content = @Content(schema = @Schema(implementation = DogRecommendationSurveyResponse.class))),
            @ApiResponse(responseCode = "404", description = "유저 ID에 해당하는 설문을 찾을 수 없음")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<DogRecommendationSurveyResponse> getSurveyByUserId(
            @Parameter(description = "조회할 유저 ID") @PathVariable Long userId) {
        DogRecommendationSurveyResponse response = dogRecommendationSurveyService.getSurveyByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "강아지 추천 설문 수정", description = "특정 유저의 강아지 추천 설문 응답을 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "설문 수정 성공",
                    content = @Content(schema = @Schema(implementation = DogRecommendationSurveyResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "404", description = "유저 ID에 해당하는 설문을 찾을 수 없음")
    })
    @PutMapping("/user/{userId}")
    public ResponseEntity<DogSurveyWithRecommendationsResponse> updateSurvey(
            @PathVariable Long userId,
            @Valid @RequestBody DogRecommendationSurveyUpdateRequest request
    ) {
        DogRecommendationSurveyResponse survey = dogRecommendationSurveyService.updateSurvey(userId, request);

        recommendationCacheService.evict(survey.getUserId());
        recommendationAsyncService.generateRecommendations(survey);

        DogSurveyWithRecommendationsResponse body =
                new DogSurveyWithRecommendationsResponse(survey, List.of());
        return ResponseEntity.ok(body);
    }

    @Operation(summary = "강아지 추천 설문 삭제", description = "특정 유저의 강아지 추천 설문 응답을 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "설문 삭제 성공 (No Content)"),
            @ApiResponse(responseCode = "404", description = "유저 ID에 해당하는 설문을 찾을 수 없음")
    })
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteSurveyByUserId(
            @Parameter(description = "삭제할 유저 ID") @PathVariable Long userId) {
        dogRecommendationSurveyService.deleteSurveyByUserId(userId);
        recommendationCacheService.evict(userId);
        return ResponseEntity.noContent().build();
    }


    // Helper
    private List<RecommendedDogDto> buildRecommendationsFromMatches(
            List<RecommendationMatch> matches,
            Long userId
    ) {
        if (matches == null || matches.isEmpty()) {
            return List.of();
        }

        List<Long> dogIds = matches.stream()
                .map(RecommendationMatch::dogId)
                .toList();
        List<DogSummaryResponse> summaries = dogService.getDogSummariesByIds(dogIds, userId);

        Map<Long, DogSummaryResponse> summaryById = new HashMap<>(summaries.size());
        for (DogSummaryResponse summary : summaries) {
            summaryById.put(summary.getDogId(), summary);
        }

        List<RecommendedDogDto> recs = new ArrayList<>(matches.size());
        for (RecommendationMatch match : matches) {
            DogSummaryResponse summary = summaryById.get(match.dogId());
            if (summary == null) {
                continue;
            }
            recs.add(RecommendedDogDto.fromSummary(summary, match.similarity()));
        }
        return recs;
    }

    private boolean isCacheFresh(RecommendationCacheEntry cached, DogRecommendationSurveyResponse survey) {
        if (cached == null || survey == null) {
            return false;
        }
        if (cached.surveyUpdatedAt() == null || survey.getUpdatedAt() == null) {
            return false;
        }
        return Objects.equals(cached.surveyUpdatedAt(), survey.getUpdatedAt());
    }
}
