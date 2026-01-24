package com.example.backend.repository;

import com.example.backend.domain.auth.AuthProvider;
import com.example.backend.domain.auth.AuthUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    Optional<AuthUser> findByProviderAndOauthId(AuthProvider provider, String oauthId);

    @Transactional
    void deleteByUserUserId(Long userId);
}
