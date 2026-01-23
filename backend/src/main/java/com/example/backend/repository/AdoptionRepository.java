package com.example.backend.repository;

import com.example.backend.domain.adoption.Adoption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionRepository extends JpaRepository<Adoption, Long> {
    Optional<Adoption> findByUser_idAndAbandonedDog_id(Long userId, Long abandonedDogId);
}
