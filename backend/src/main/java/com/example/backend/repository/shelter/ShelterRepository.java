package com.example.backend.repository.shelter;

import com.example.backend.domain.shelter.Shelter;
import com.example.backend.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    Optional<Shelter> findByCareNmAndAddress(String careNm, String address);
    Optional<Shelter> findByUserUserId(Long userId);
}
