package com.example.backend.api.adoption.controller.document;

import com.example.backend.api.adoption.dto.document.UploadedDocumentResponse;
import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.service.adoption.AdoptionDocumentService;
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

import java.util.List;
import java.util.Map;

@Tag(name = "입양 문서 API", description = "입양 프로세스 문서 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions/{adoptionId}/documents")
public class AdoptionDocumentController {

    private final AdoptionDocumentService adoptionDocumentService;

    @Operation(summary = "입양 문서 업로드", description = "입양 프로세스에 필요한 여러 종류의 문서를 업로드합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "문서 업로드 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터 또는 파일 업로드 실패"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadAdoptionDocuments(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId,
            @RequestParam Map<String, DocumentType> documentTypes, // 각 파일의 DocumentType을 맵으로 받음
            @RequestPart("files") List<MultipartFile> files // 실제 파일 목록
    ) {
        adoptionDocumentService.uploadAdoptionDocuments(adoptionId, documentTypes, files);
        return ResponseEntity.ok("Documents uploaded successfully.");
    }

    @Operation(summary = "업로드된 입양 문서 목록 조회", description = "해당 입양 프로세스에 업로드된 모든 문서의 목록을 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "문서 목록 조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 입양 프로세스를 찾을 수 없음")
    })
    @GetMapping
    public ResponseEntity<List<UploadedDocumentResponse>> getUploadedDocuments(
            @Parameter(description = "입양 프로세스 ID") @PathVariable Long adoptionId) {
        List<UploadedDocumentResponse> documents = adoptionDocumentService.getUploadedDocuments(adoptionId);
        return ResponseEntity.ok(documents);
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
