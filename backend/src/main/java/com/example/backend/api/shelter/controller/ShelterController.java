package com.example.backend.api.shelter.controller;

import com.example.backend.api.dog.dto.DogDetailResponse;
import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.api.dog.dto.DogUpdateRequest;
import com.example.backend.service.shelter.ShelterService;
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

@Tag(name = "보호소 API", description = "보호소 관련 정보 조회 API")
@RestController
@RequestMapping("/api/shelters")
@RequiredArgsConstructor
public class ShelterController {

    private final ShelterService shelterService;

    @Operation(summary = "특정 보호소의 강아지 목록 조회", description = "특정 보호소 ID에 소속된 강아지 목록을 상태별 필터링과 함께 페이지네이션하여 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 ID의 보호소를 찾을 수 없음")
    })
    @GetMapping("/{shelterId}/dogs")
    public ResponseEntity<Page<DogSummaryResponse>> getShelterDogs(
            @Parameter(description = "보호소의 고유 ID", required = true)
            @PathVariable Long shelterId,
            @Parameter(description = "검색할 상태 (예: '보호중', '공고중')")
            @RequestParam(required = false) String processState,
            @Parameter(description = "페이지 요청 정보 (0-based page, size, sort)")
            @PageableDefault(size = 12, sort = "happenDt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<DogSummaryResponse> dogs = shelterService.getDogsByShelter(shelterId, processState, pageable);
        return ResponseEntity.ok(dogs);
    }

    @Operation(summary = "보호소의 강아지 정보 수정", description = "특정 보호소에 소속된 강아지의 정보를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (해당 보호소의 강아지가 아님)"),
            @ApiResponse(responseCode = "404", description = "해당 ID의 보호소 또는 강아지를 찾을 수 없음")
    })
    @PutMapping("/{shelterId}/dogs/{dogId}")
    public ResponseEntity<DogDetailResponse> updateDogInShelter(
            @Parameter(description = "보호소의 고유 ID", required = true) @PathVariable Long shelterId,
            @Parameter(description = "수정할 강아지의 ID", required = true) @PathVariable Long dogId,
            @RequestBody DogUpdateRequest request
    ) {
        DogDetailResponse updatedDog = shelterService.updateDogInShelter(shelterId, dogId, request);
        return ResponseEntity.ok(updatedDog);
    }

    @Operation(summary = "보호소의 강아지 정보 삭제", description = "특정 보호소에 소속된 강아지의 정보를 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음 (해당 보호소의 강아지가 아님)"),
            @ApiResponse(responseCode = "404", description = "해당 ID의 보호소 또는 강아지를 찾을 수 없음")
    })
    @DeleteMapping("/{shelterId}/dogs/{dogId}")
    public ResponseEntity<Void> deleteDogInShelter(
            @Parameter(description = "보호소의 고유 ID", required = true) @PathVariable Long shelterId,
            @Parameter(description = "삭제할 강아지의 ID", required = true) @PathVariable Long dogId
    ) {
        shelterService.deleteDogInShelter(shelterId, dogId);
        return ResponseEntity.noContent().build();
    }
}
