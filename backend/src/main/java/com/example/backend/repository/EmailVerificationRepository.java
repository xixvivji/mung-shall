package com.example.backend.repository;

import com.example.backend.domain.auth.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, String purpose);
}