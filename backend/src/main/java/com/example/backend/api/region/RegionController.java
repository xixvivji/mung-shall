package com.example.backend.api.region;

import com.example.backend.api.region.dto.SidoResponse;
import com.example.backend.api.region.dto.SigunguResponse;
import com.example.backend.service.region.RegionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "지역 API", description = "시도, 시군구 지역 정보 조회 API")
@RestController
@RequestMapping("/api/region")
@RequiredArgsConstructor
public class RegionController {

    private final RegionService regionService;

    @Operation(summary = "시도 목록 조회", description = "전체 시도 목록을 조회합니다.")
    @GetMapping("/sido")
    public ResponseEntity<List<SidoResponse>> getAllSido() {
        List<SidoResponse> sidoList = regionService.getAllSido();
        return ResponseEntity.ok(sidoList);
    }

    @Operation(summary = "특정 시도에 속한 시군구 목록 조회", description = "시도 코드를 이용하여 해당 시도에 속한 시군구 전체 목록을 조회합니다.")
    @GetMapping("/sido/{sidoOrgCd}/sigungu")
    public ResponseEntity<List<SigunguResponse>> getSigunguBySido(
            @Parameter(description = "시도 기관 코드(orgCd)", required = true, example = "6110000")
            @PathVariable String sidoOrgCd
    ) {
        List<SigunguResponse> sigunguList = regionService.getSigunguBySido(sidoOrgCd);
        return ResponseEntity.ok(sigunguList);
    }
}
