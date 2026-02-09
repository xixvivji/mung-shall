package com.example.backend.api.adoption.controller.document;

import com.example.backend.api.adoption.dto.document.UploadedDocumentResponse;
import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.service.adoption.document.AdoptionDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

// 여러 문서 한번에 업로드 하게 multi-part 공부
@Tag(name = "입양 : 4. 입양 문서 API", description = "입양 프로세스 문서 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions/{adoptionId}/documents")
public class AdoptionDocumentController {

    private final AdoptionDocumentService adoptionDocumentService;

    @Operation(summary = "입양 문서 업로드", description = "입양 프로세스에 필요한 특정 종류의 문서를 업로드합니다. 이미 해당 타입의 문서가 존재하면 기존 문서를 삭제하고 새 문서를 업로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "문서 업로드 성공",
                    content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 또는 파일 업로드 실패"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @PostMapping(value = "/{documentType}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Long>> uploadDocument(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Parameter(description = "업로드할 문서 종류 (FAMILY_RELATIONSHIP_CERTIFICATE, LEASE_AGREEMENT, RESIDENT_REGISTRATION_COPY 등)")
            @PathVariable DocumentType documentType,
            @RequestPart("file") MultipartFile file
    ) {
        Long uploadedDocumentId = adoptionDocumentService.uploadDocument(adoptionId, documentType, file);
        return ResponseEntity.ok(Map.of("documentId", uploadedDocumentId));
    }

    @Operation(summary = "업로드된 특정 입양 문서 조회", description = "해당 입양 프로세스에 업로드된 특정 종류의 문서를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "문서 조회 성공",
                    content = @Content(schema = @Schema(implementation = UploadedDocumentResponse.class))),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스 또는 문서를 찾을 수 없음")
    })
    @GetMapping("/{documentType}")
    public ResponseEntity<UploadedDocumentResponse> getUploadedDocument(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Parameter(description = "조회할 문서 종류") @PathVariable DocumentType documentType) {
        UploadedDocumentResponse document = adoptionDocumentService.getUploadedDocument(adoptionId, documentType);
        return ResponseEntity.ok(document);
    }

    @Operation(summary = "업로드된 입양 문서 삭제", description = "특정 문서를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "문서 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "해당 문서나 입양 프로세스를 찾을 수 없음"),
            @ApiResponse(responseCode = "403", description = "문서를 삭제할 권한이 없음")
    })
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteUploadedDocument(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @Parameter(description = "삭제할 문서 ID") @PathVariable Long documentId) {
        adoptionDocumentService.deleteUploadedDocument(adoptionId, documentId);
        return ResponseEntity.ok(Map.of("message", "문서가 성공적으로 삭제되었습니다."));
    }
}
