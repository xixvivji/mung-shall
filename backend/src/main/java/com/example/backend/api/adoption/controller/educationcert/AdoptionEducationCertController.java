package com.example.backend.api.adoption.controller.educationcert;

import com.example.backend.api.adoption.dto.educationcert.AdoptionEducationCertUploadRequest;
import com.example.backend.api.adoption.dto.educationcert.AdoptionEducationCertResponse;
import com.example.backend.service.adoption.educationCert.AdoptionEducationCertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "입양 : 2. 입양 교육 수료증 API", description = "입양 교육 수료증 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions/{adoptionId}/education-cert")
public class AdoptionEducationCertController {

    private final AdoptionEducationCertService adoptionEducationCertService;

    @Operation(summary = "교육 수료증 업로드", description = "입양 교육 수료증을 업로드하고 관련 정보를 저장합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수료증 업로드 및 정보 저장 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionEducationCertResponse.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 또는 파일 업로드 실패"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AdoptionEducationCertResponse> uploadEducationCertificate(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Valid @ModelAttribute AdoptionEducationCertUploadRequest request) {
        AdoptionEducationCertResponse response = adoptionEducationCertService.uploadEducationCertificate(
                adoptionId,
                request.getEducationInstitution(),
                request.getCertificateNumber(),
                request.getCompletionDate(),
                request.getCertificateFile()
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "교육 수료증 조회", description = "특정 입양 프로세스의 교육 수료증 상세 정보를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수료증 조회 성공",
                    content = @Content(schema = @Schema(implementation = AdoptionEducationCertResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 수료증을 찾을 수 없음")
    })
    @GetMapping
    public ResponseEntity<AdoptionEducationCertResponse> getEducationCertificate(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        AdoptionEducationCertResponse response = adoptionEducationCertService.getEducationCertificate(adoptionId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "교육 수료증 삭제", description = "제출했던 교육 수료증을 삭제하고 단계를 다시 제출할 수 있도록 초기화합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수료증 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @DeleteMapping
    public ResponseEntity<?> deleteEducationCertificate(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        adoptionEducationCertService.deleteEducationCertificate(adoptionId);
        return ResponseEntity.ok(Map.of("message", "교육 수료증이 성공적으로 삭제되었습니다."));
    }
}
