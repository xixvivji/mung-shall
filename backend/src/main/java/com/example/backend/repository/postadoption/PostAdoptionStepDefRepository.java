package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.PostAdoptionStepDef;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostAdoptionStepDefRepository extends JpaRepository<PostAdoptionStepDef, Long> {
    List<PostAdoptionStepDef> findAllByOrderByDefaultOrderAsc();
    Optional<PostAdoptionStepDef> findByName(String name);
}
