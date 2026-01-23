package com.example.backend.api.adoption;

import com.example.backend.api.adoption.dto.AdoptionApplicationRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse;
import com.example.backend.api.adoption.dto.AdoptionCreateRequest;
import com.example.backend.service.AdoptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/adoptions")
public class AdoptionController {

    private final AdoptionService adoptionService;

    /**
     * 초기 입양 프로세스를 생성합니다.
     * 사용자가 '입양하기' 버튼을 눌렀을 때 호출됩니다.
     *
     * @param request 사용자 ID와 유기견 ID를 포함하는 요청 DTO
     * @return 생성된 Adoption의 ID
     */
    @PostMapping("/init")
    public ResponseEntity<?> createAdoptionProcess(@Valid @RequestBody AdoptionCreateRequest request) {
        Long adoptionId = adoptionService.createAdoptionProcess(request.getUserId(), request.getAbandonedDogId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("adoptionId", adoptionId));
    }

    /**
     * 입양 신청서 상세 정보를 제출하거나 수정합니다.
     * 첫 번째 단계인 '입양 신청서 제출' 단계에서 호출됩니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param request    입양 신청서 요청 DTO
     * @return 저장되거나 업데이트된 AdoptionApplication의 응답 DTO
     */
    @PostMapping("/{adoptionId}/application")
    public ResponseEntity<AdoptionApplicationResponse> submitAdoptionApplication(
            @PathVariable Long adoptionId,
            @Valid @RequestBody AdoptionApplicationRequest request) {
        AdoptionApplicationResponse response = adoptionService.submitAdoptionApplication(adoptionId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 입양 프로세스의 입양 신청서 상세 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 입양 신청서 응답 DTO
     */
    @GetMapping("/{adoptionId}/application")
    public ResponseEntity<AdoptionApplicationResponse> getAdoptionApplication(@PathVariable Long adoptionId) {
        AdoptionApplicationResponse response = adoptionService.getAdoptionApplication(adoptionId);
        return ResponseEntity.ok(response);
    }

    /**
     * 입양 프로세스를 취소합니다.
     *
     * @param adoptionId 취소할 입양 프로세스 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{adoptionId}")
    public ResponseEntity<?> cancelAdoptionProcess(@PathVariable Long adoptionId) {
        adoptionService.cancelAdoptionProcess(adoptionId);
        return ResponseEntity.ok(Map.of("message", "입양 프로세스가 성공적으로 취소되었습니다."));
    }
}
