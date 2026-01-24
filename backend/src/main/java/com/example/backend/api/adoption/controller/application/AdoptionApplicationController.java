package com.example.backend.api.adoption.controller.application;

import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse;
import com.example.backend.service.adoption.AdoptionApplicationService;
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

@Tag(name = "입양 신청서 API", description = "입양 신청서 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions/{adoptionId}/application")
public class AdoptionApplicationController {

    private final AdoptionApplicationService adoptionApplicationService;

    @Operation(summary = "입양 신청서 제출/수정", description = "입양 프로세스의 첫 단계인 입양 신청서를 제출하거나 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 신청서 제출/수정 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionApplicationResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @PostMapping
    public ResponseEntity<AdoptionApplicationResponse> submitAdoptionApplication(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Valid @RequestBody AdoptionApplicationRequest request) {
        AdoptionApplicationResponse response = adoptionApplicationService.submitAdoptionApplication(adoptionId, request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 신청서 조회", description = "특정 입양 프로세스의 입양 신청서 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "입양 신청서 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionApplicationResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 신청서를 찾을 수 없음")
    })
    @GetMapping
    public ResponseEntity<AdoptionApplicationResponse> getAdoptionApplication(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionApplicationResponse response = adoptionApplicationService.getAdoptionApplication(adoptionId);
        return ResponseEntity.ok(response);
    }
}
