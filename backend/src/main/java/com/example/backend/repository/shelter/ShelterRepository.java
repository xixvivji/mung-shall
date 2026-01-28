package com.example.backend.repository.shelter;

import com.example.backend.domain.shelter.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShelterRepository extends JpaRepository<Shelter, Long> {
}
