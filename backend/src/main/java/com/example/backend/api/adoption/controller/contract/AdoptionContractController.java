package com.example.backend.api.adoption.controller.contract;

import com.example.backend.api.adoption.dto.contract.AdoptionContractResponse;
import com.example.backend.service.adoption.contract.AdoptionContractService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "입양 : 5. 입양 계약서 API", description = "입양 계약서 관련 기능을 제공하는 API")
@RestController
@RequestMapping("/api/adoptions/{adoptionId}/contract")
@RequiredArgsConstructor
public class AdoptionContractController {

    private final AdoptionContractService adoptionContractService;

    /**
     * 입양 계약서 파일을 업로드합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param contractFile 입양 계약서 파일 (MultipartFile)
     * @return 업로드된 입양 계약서 정보
     */
    @Operation(summary = "입양 계약서 업로드", description = "특정 입양 프로세스에 대한 입양 계약서 파일을 업로드합니다.")
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<AdoptionContractResponse> uploadAdoptionContract(
            @PathVariable Long adoptionId,
            @RequestPart("contractFile") MultipartFile contractFile) {
        AdoptionContractResponse response = adoptionContractService.uploadAdoptionContract(adoptionId, contractFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 특정 입양 프로세스의 입양 계약서 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 입양 계약서 정보
     */
    @Operation(summary = "입양 계약서 조회", description = "특정 입양 프로세스에 업로드된 입양 계약서 정보를 조회합니다.")
    @GetMapping
    public ResponseEntity<AdoptionContractResponse> getAdoptionContract(@PathVariable Long adoptionId) {
        AdoptionContractResponse response = adoptionContractService.getAdoptionContract(adoptionId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 입양 프로세스의 입양 계약서를 삭제합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 성공 여부
     */
    @Operation(summary = "입양 계약서 삭제", description = "특정 입양 프로세스에 업로드된 입양 계약서를 삭제합니다.")
    @DeleteMapping
    public ResponseEntity<Void> deleteAdoptionContract(@PathVariable Long adoptionId) {
        adoptionContractService.deleteAdoptionContract(adoptionId);
        return ResponseEntity.noContent().build();
    }
}
