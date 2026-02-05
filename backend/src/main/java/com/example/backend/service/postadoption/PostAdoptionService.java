package com.example.backend.service.postadoption;

import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PostAdoptionService {

    private final PostAdoptionRepository postAdoptionRepository;

    /**
     * 특정 입양 후 프로세스를 조회합니다.
     * @param postAdoptionId 입양 후 프로세스 ID
     * @return PostAdoption 엔티티
     */
    @Transactional(readOnly = true)
    public PostAdoption getPostAdoptionProcess(Long postAdoptionId) {
        return postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));
    }
}
