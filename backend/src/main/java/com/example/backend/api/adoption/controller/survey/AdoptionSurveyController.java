package com.example.backend.api.adoption.controller.survey;

import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse;
import com.example.backend.service.adoption.survey.AdoptionSurveyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "입양 : 1. 입양사전 설문 API", description = "입양사전 설문 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions/{adoptionId}/survey")
public
class AdoptionSurveyController {

    private final AdoptionSurveyService adoptionSurveyService;

    @Operation(summary = "입양사전 설문 제출/수정", description = "입양 프로세스의 첫 단계인 입양사전 설문을 제출하거나 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양사전 설문 제출/수정 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionSurveyResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<AdoptionSurveyResponse> submitAdoptionSurvey(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Valid @RequestBody AdoptionSurveyRequest request) {
        AdoptionSurveyResponse response = adoptionSurveyService.submitAdoptionSurvey(adoptionId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양사전 설문 조회", description = "특정 입양 프로세스의 입양사전 설문 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양사전 설문 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionSurveyResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 설문을 찾을 수 없음")
    })
    @GetMapping
    public ResponseEntity<AdoptionSurveyResponse> getAdoptionSurvey(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionSurveyResponse response = adoptionSurveyService.getAdoptionSurvey(adoptionId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양사전 설문 삭제", description = "제출했던 입양사전 설문 내용을 삭제하고 단계를 다시 작성할 수 있도록 초기화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "설문 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @DeleteMapping
    public ResponseEntity<?> deleteAdoptionSurvey(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        adoptionSurveyService.deleteAdoptionSurvey(adoptionId);
        return ResponseEntity.ok(Map.of("message", "입양사전 설문이 성공적으로 삭제되었습니다."));
    }
}
