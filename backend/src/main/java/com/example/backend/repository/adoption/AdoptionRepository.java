package com.example.backend.repository.adoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionRepository extends JpaRepository<Adoption, Long> {
    Optional<Adoption> findByAbandonedDogAndProcessStatus(AbandonedDog abandonedDog, AdoptionProcessStatus status);

    boolean existsByUser_UserIdAndProcessStatus(
            Long userId,
            AdoptionProcessStatus status
    );

    List<Adoption> findByUserAndProcessStatus(User user, AdoptionProcessStatus status);
}
