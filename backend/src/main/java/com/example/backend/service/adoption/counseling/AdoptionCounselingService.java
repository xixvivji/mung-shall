package com.example.backend.service.adoption.counseling;

import com.example.backend.api.adoption.dto.counseling.AdoptionCounselingRequest;
import com.example.backend.api.adoption.dto.counseling.AdoptionCounselingResponse;
import com.example.backend.common.ApiException;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.step.counseling.AdoptionCounseling;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.counseling.AdoptionCounselingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdoptionCounselingService {

    private final AdoptionCounselingRepository adoptionCounselingRepository;
    private final AdoptionRepository adoptionRepository;

    @Transactional
    public AdoptionCounselingResponse createCounseling(AdoptionCounselingRequest request) {
        Adoption adoption = adoptionRepository.findById(request.getAdoptionId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "입양 신청 정보를 찾을 수 없습니다."));

        AdoptionCounseling counseling = new AdoptionCounseling(adoption, request.getCounselingDate());
        adoptionCounselingRepository.save(counseling);
        return new AdoptionCounselingResponse(counseling);
    }

    public AdoptionCounselingResponse getCounseling(Long counselingId) {
        AdoptionCounseling counseling = adoptionCounselingRepository.findById(counselingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "상담 정보를 찾을 수 없습니다."));
        return new AdoptionCounselingResponse(counseling);
    }

    @Transactional
    public AdoptionCounselingResponse updateCounseling(Long counselingId, AdoptionCounselingRequest request) {
        AdoptionCounseling counseling = adoptionCounselingRepository.findById(counselingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "상담 정보를 찾을 수 없습니다."));

        counseling.updateCounseling(request.getCounselingDate());
        // save를 호출하지 않아도 @Transactional에 의해 변경 감지(dirty checking)로 자동 업데이트 됩니다.
        return new AdoptionCounselingResponse(counseling);
    }

    @Transactional
    public void cancelCounseling(Long counselingId) {
        AdoptionCounseling counseling = adoptionCounselingRepository.findById(counselingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "상담 정보를 찾을 수 없습니다."));

        counseling.cancel();
        // save를 호출하지 않아도 @Transactional에 의해 변경 감지(dirty checking)로 자동 업데이트 됩니다.
    }
}