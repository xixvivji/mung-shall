package com.example.backend.repository;

import com.example.backend.domain.user.User;
import com.example.backend.domain.user.UserType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUserTypeAndShelterRegNo(UserType userType, String shelterRegNo);
}
