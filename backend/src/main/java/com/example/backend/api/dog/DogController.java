package com.example.backend.api.dog;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.service.DogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dogs")
@RequiredArgsConstructor
public class DogController {

    private final DogService dogService;

    @GetMapping
    public ResponseEntity<Page<DogSummaryResponse>> getDogs(
            @PageableDefault(size = 12, sort = "happenDt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DogSummaryResponse> dogs = dogService.getDogs(pageable);
        return ResponseEntity.ok(dogs);
    }

    /**
     * 특정 ID의 유기견 상세 정보를 조회합니다.
     * @param id 유기견의 고유 ID
     * @return ResponseEntity<DogDetailResponse>
     */
    @GetMapping("/{id}")
    public ResponseEntity<DogDetailResponse> getDogDetail(@PathVariable Long id) {
        DogDetailResponse dogDetail = dogService.getDogDetail(id);
        return ResponseEntity.ok(dogDetail);
    }
}
