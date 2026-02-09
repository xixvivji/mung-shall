package com.example.backend.repository.shelter;

import com.example.backend.domain.shelter.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ShelterRepository extends JpaRepository<Shelter, Long> {
    Optional<Shelter> findByCareNmAndAddress(String careNm, String address);

    @Query("SELECT s FROM Shelter s WHERE s.owner.userId = :userId")
    Optional<Shelter> findByOwner_UserId(@Param("userId") Long userId);
}
