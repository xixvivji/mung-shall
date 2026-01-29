package com.example.backend.api.dog;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.service.dog.DogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "유기견 API", description = "유기견 정보 조회 API")
@RestController
@RequestMapping("/api/dogs")
@RequiredArgsConstructor
public class DogController {

    private final DogService dogService;

    @Operation(summary = "유기견 목록 조회", description = "페이지네이션과 동적 필터링(지역, 성별, 상태)을 사용하여 유기견 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
    })
    @GetMapping
    public ResponseEntity<Page<DogSummaryResponse>> getDogs(
            @Parameter(description = "검색할 지역명 (e.g., '경기도', '수원시')")
            @RequestParam(required = false) String region,
            @Parameter(description = "검색할 성별 코드 (M: 수컷, F: 암컷, Q: 미상)")
            @RequestParam(required = false) String sexCd,
            @Parameter(description = "검색할 상태 (공고중, 보호중, 종료)")
            @RequestParam(required = false) String processState,
            @Parameter(description = "페이지 요청 정보 (0-based page, size, sort)")
            @PageableDefault(size = 12, sort = "happenDt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DogSummaryResponse> dogs = dogService.getDogs(region, sexCd, processState, pageable);
        return ResponseEntity.ok(dogs);
    }

    @Operation(summary = "유기견 상세 정보 조회", description = "특정 ID의 유기견 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 ID의 유기견을 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<DogDetailResponse> getDogDetail(
            @Parameter(description = "유기견의 고유 ID", required = true) @PathVariable Long id
    ) {
        DogDetailResponse dogDetail = dogService.getDogDetail(id);
        return ResponseEntity.ok(dogDetail);
    }

    @Operation(summary = "유기견 품종 목록 조회", description = "관리되는 모든 유기견 품종 목록을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
    })
    @GetMapping("/kinds")
    public ResponseEntity<List<String>> getDogKinds() {
        List<String> dogKinds = dogService.getAllDogKinds();
        return ResponseEntity.ok(dogKinds);
    }
}
