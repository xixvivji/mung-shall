package com.example.backend.repository.dog.interest;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.interest.UserDogInterest;
import com.example.backend.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDogInterestRepository extends JpaRepository<UserDogInterest, Long> {
    Optional<UserDogInterest> findByUserAndAbandonedDog(User user, AbandonedDog abandonedDog);
    List<UserDogInterest> findAllByUser(User user);
    boolean existsByUserAndAbandonedDog(User user, AbandonedDog abandonedDog);
}