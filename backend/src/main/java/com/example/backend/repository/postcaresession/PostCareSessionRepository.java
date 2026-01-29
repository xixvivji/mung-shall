package com.example.backend.repository.postcaresession;

import com.example.backend.domain.postcaresession.PostCareSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostCareSessionRepository extends JpaRepository<PostCareSession, Long> {
    // 세션 ID로 상담 내역 찾기
    Optional<PostCareSession> findBySessionId(String sessionId);
}