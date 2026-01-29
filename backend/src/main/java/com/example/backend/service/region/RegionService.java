package com.example.backend.service.region;

import com.example.backend.api.region.dto.SidoResponse;
import com.example.backend.api.region.dto.SigunguResponse;
import com.example.backend.domain.region.Sido;
import com.example.backend.repository.region.SidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegionService {

    private final SidoRepository sidoRepository;

    public List<SidoResponse> getAllSido() {
        return sidoRepository.findAll().stream()
                .map(SidoResponse::new)
                .collect(Collectors.toList());
    }

    public List<SigunguResponse> getSigunguBySido(String sidoOrgCd) {
        Sido sido = sidoRepository.findById(sidoOrgCd)
                .orElseThrow(() -> new IllegalArgumentException("Invalid sido org code: " + sidoOrgCd));

        return sido.getSigunguList().stream()
                .map(SigunguResponse::new)
                .collect(Collectors.toList());
    }
}
