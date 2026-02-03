package com.example.backend.api.recommendation;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyCreateRequest;
import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import com.example.backend.api.recommendation.dto.DogRecommendationSurveyUpdateRequest;
import com.example.backend.service.recommendation.DogRecommendationSurveyService;
import com.example.backend.security.principal.CustomUserPrincipal;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

// {userId}를 쿼리 파라미터로 쓰지 말고, 인증 정보로 가져오기 파라미터 없이
@Tag(name = "강아지 추천 설문 API", description = "유저의 강아지 추천 설문 CRUD API")
@RestController
@RequestMapping("/api/recommendation/survey")
@RequiredArgsConstructor
public class DogRecommendationSurveyController {

    private final DogRecommendationSurveyService dogRecommendationSurveyService;

    @Operation(summary = "강아지 추천 설문 생성", description = "유저의 강아지 추천 설문 응답을 생성합니다. 유저당 하나의 설문만 생성 가능합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "설문 생성 성공",
                    content = @Content(schema = @Schema(implementation = DogRecommendationSurveyResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 이미 설문이 존재함, 유저 ID 없음)"),
            @ApiResponse(responseCode = "404", description = "유저를 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<DogRecommendationSurveyResponse> createSurvey(@Valid @RequestBody DogRecommendationSurveyCreateRequest request) {
        DogRecommendationSurveyResponse response = dogRecommendationSurveyService.createSurvey(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
    public ResponseEntity<DogRecommendationSurveyResponse> updateSurvey(
            @Parameter(description = "수정할 유저 ID") @PathVariable Long userId,
            @Valid @RequestBody DogRecommendationSurveyUpdateRequest request) {
        DogRecommendationSurveyResponse response = dogRecommendationSurveyService.updateSurvey(userId, request);
        return ResponseEntity.ok(response);
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
        return ResponseEntity.noContent().build();
    }
}
