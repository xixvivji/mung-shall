package com.example.backend.repository.dog.personality;

import com.example.backend.domain.dog.personality.DogPersonality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DogPersonalityRepository extends JpaRepository<DogPersonality, Long> {

    Optional<DogPersonality> findByAbandonedDog_Id(Long abandonedDogId);

    boolean existsByAbandonedDog_Id(Long abandonedDogId);

}
