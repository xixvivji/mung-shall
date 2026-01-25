package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.PostAdoption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostAdoptionRepository extends JpaRepository<PostAdoption, Long> {
    Optional<PostAdoption> findByAdoptionId(Long adoptionId);
}
