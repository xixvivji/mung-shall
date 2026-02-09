package com.example.backend.api.faq;

import com.example.backend.api.faq.dto.FAQRequest;
import com.example.backend.api.faq.dto.FAQResponse;
import com.example.backend.service.faq.FAQService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "FAQ API", description = "자주 묻는 질문(FAQ) 관리 API")
@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FAQController {

    private final FAQService faqService;

    @Operation(summary = "새로운 FAQ 생성", description = "새로운 자주 묻는 질문(FAQ)을 생성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "FAQ 생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터")
    })
    @PostMapping
    public ResponseEntity<FAQResponse> createFaq(@Valid @RequestBody FAQRequest faqRequest) {
        FAQResponse createdFaq = faqService.createFaq(faqRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFaq);
    }

    @Operation(summary = "모든 FAQ 조회", description = "페이지네이션을 사용하여 모든 FAQ 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "FAQ 목록 조회 성공")
    })
    @GetMapping
    public ResponseEntity<Page<FAQResponse>> getAllFaqs(
            @Parameter(description = "페이지 요청 정보 (0-based page, size, sort)")
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<FAQResponse> faqs = faqService.getAllFaqs(pageable);
        return ResponseEntity.ok(faqs);
    }

    @Operation(summary = "ID로 FAQ 조회", description = "특정 ID의 FAQ 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "FAQ 조회 성공"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<FAQResponse> getFaqById(
            @Parameter(description = "FAQ의 고유 ID", required = true) @PathVariable Long id
    ) {
        FAQResponse faq = faqService.getFaqById(id);
        return ResponseEntity.ok(faq);
    }

    @Operation(summary = "FAQ 수정", description = "특정 ID의 FAQ를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "FAQ 수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음")
    })
    @PutMapping("/{id}")
    public ResponseEntity<FAQResponse> updateFaq(
            @Parameter(description = "FAQ의 고유 ID", required = true) @PathVariable Long id,
            @Valid @RequestBody FAQRequest faqRequest
    ) {
        FAQResponse updatedFaq = faqService.updateFaq(id, faqRequest);
        return ResponseEntity.ok(updatedFaq);
    }

    @Operation(summary = "FAQ 삭제", description = "특정 ID의 FAQ를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "FAQ 삭제 성공"),
            @ApiResponse(responseCode = "404", description = "FAQ를 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaq(
            @Parameter(description = "FAQ의 고유 ID", required = true) @PathVariable Long id
    ) {
        faqService.deleteFaq(id);
        return ResponseEntity.noContent().build();
    }
}
