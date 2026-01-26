package com.example.backend.repository.adoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.user.User;
import com.example.backend.domain.dog.AbandonedDog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionRepository extends JpaRepository<Adoption, Long> {
    Optional<Adoption> findByUserAndAbandonedDog(User user, AbandonedDog abandonedDog);
}
