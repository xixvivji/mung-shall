package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.PostAdoptionStepInstance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostAdoptionStepInstanceRepository extends JpaRepository<PostAdoptionStepInstance, Long> {
    List<PostAdoptionStepInstance> findByPostAdoptionIdOrderByStepOrderAsc(Long postAdoptionId);
    Optional<PostAdoptionStepInstance> findByPostAdoptionIdAndStepName(Long postAdoptionId, String stepName);
}
