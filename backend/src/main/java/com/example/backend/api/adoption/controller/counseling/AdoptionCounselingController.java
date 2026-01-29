package com.example.backend.api.adoption.controller.counseling;

import com.example.backend.api.adoption.dto.AdoptionStepInstanceResponse;
import com.example.backend.api.adoption.dto.counseling.CounselingApplicationRequest;
import com.example.backend.api.adoption.dto.counseling.CounselingModificationRequest;
import com.example.backend.api.adoption.dto.counseling.RejectionRequest;
import com.example.backend.service.adoption.counseling.AdoptionCounselingService;
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

@Tag(name = "입양 : 3. 입양 상담 API", description = "입양 상담 프로세스 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions")
public class AdoptionCounselingController {

    private final AdoptionCounselingService adoptionCounselingService;

    @Operation(summary = "입양 상담 단계 정보 조회", description = "특정 입양 프로세스의 상담(Step 3) 단계 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상담 단계 정보 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionStepInstanceResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 상담 단계를 찾을 수 없음")
    })
    @GetMapping("/{adoptionId}/counseling-step")
    public ResponseEntity<AdoptionStepInstanceResponse> getAdoptionCounselingStep(
            @Parameter(description = "조회할 입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionStepInstanceResponse response = adoptionCounselingService.getAdoptionCounselingStep(adoptionId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 상담 단계 신청", description = "특정 입양 프로세스의 상담(Step 3) 단계를 신청합니다. 상담 날짜와 시간을 지정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상담 단계 신청 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionStepInstanceResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 신청 불가능한 상태"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 상담 단계를 찾을 수 없음")
    })
    @PostMapping("/{adoptionId}/counseling-step/apply")
    public ResponseEntity<AdoptionStepInstanceResponse> applyForCounseling(
            @Parameter(description = "상담을 신청할 입양 프로세스 ID") @PathVariable Long adoptionId,
            @Valid @RequestBody CounselingApplicationRequest request) {
        AdoptionStepInstanceResponse response = adoptionCounselingService.applyForCounseling(adoptionId, request.getCounselingDateTime());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 상담 단계 신청 수정", description = "특정 입양 프로세스의 상담(Step 3) 단계를 수정합니다. 상담 날짜와 시간을 변경합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상담 단계 신청 수정 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionStepInstanceResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 수정 불가능한 상태"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 상담 단계를 찾을 수 없음")
    })
    @PutMapping("/{adoptionId}/counseling-step/apply")
    public ResponseEntity<AdoptionStepInstanceResponse> modifyCounselingApplication(
            @Parameter(description = "수정할 입양 프로세스 ID") @PathVariable Long adoptionId,
            @Valid @RequestBody CounselingModificationRequest request) {
        AdoptionStepInstanceResponse response = adoptionCounselingService.modifyCounselingApplication(adoptionId, request.getNewCounselingDateTime());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "입양 상담 단계 신청 취소", description = "특정 입양 프로세스의 상담(Step 3) 단계를 취소합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "상담 단계 신청 취소 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionStepInstanceResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 취소 불가능한 상태"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 상담 단계를 찾을 수 없음")
    })
    @PostMapping("/{adoptionId}/counseling-step/cancel")
    public ResponseEntity<AdoptionStepInstanceResponse> cancelCounselingApplication(
            @Parameter(description = "취소할 입양 프로세스 ID") @PathVariable Long adoptionId) {
                    AdoptionStepInstanceResponse response = adoptionCounselingService.cancelCounselingApplication(adoptionId);        return ResponseEntity.ok(response);
    }
}
