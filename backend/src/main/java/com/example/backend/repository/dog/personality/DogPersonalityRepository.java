package com.example.backend.repository.dog.personality;

import com.example.backend.domain.dog.personality.DogPersonality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DogPersonalityRepository extends JpaRepository<DogPersonality, Long> {
}
