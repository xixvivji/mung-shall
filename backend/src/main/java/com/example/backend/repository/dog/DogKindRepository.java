package com.example.backend.repository.dog;

import com.example.backend.domain.dog.DogKind;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DogKindRepository extends JpaRepository<DogKind, Long> {
    boolean existsByName(String name);
    Optional<DogKind> findByName(String name);

    @Query("select dk.name from DogKind dk")
    List<String> findAllNames();
}
