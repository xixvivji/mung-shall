package com.example.backend.service;

import com.example.backend.common.ApiException;
import com.example.backend.domain.auth.EmailVerification;
import com.example.backend.repository.EmailVerificationRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class EmailVerificationService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final UserRepository userRepository;

    public LocalDateTime sendCode(String email, String purpose) {

        if (!"signup".equals(purpose)) {
            throw ApiException.badRequest("purpose는 signup만 허용됩니다.");
        }

        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("이미 사용 중인 이메일입니다.");
        }

        String code = String.format("%06d", new Random().nextInt(1_000_000));

        EmailVerification ev = new EmailVerification();
        ev.setEmail(email);
        ev.setPurpose(purpose);
        ev.setCode(code);
        ev.setExpiresAt(LocalDateTime.now().plusMinutes(10)); // 10분 유효

        emailVerificationRepository.save(ev);

        System.out.println("[EMAIL VERIFY] email=" + email + ", code=" + code + ", expiresAt=" + ev.getExpiresAt());

        return ev.getExpiresAt();
    }

    public void verifyCode(String email, String purpose, String code) {

        if (!"signup".equals(purpose)) {
            throw ApiException.badRequest("purpose는 signup만 허용됩니다.");
        }

        EmailVerification ev = emailVerificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> ApiException.badRequest("인증 코드가 올바르지 않습니다."));

        if (ev.isExpired()) {
            throw ApiException.badRequest("인증 코드가 만료되었습니다.");
        }

        if (code == null || code.isBlank()) {
            throw ApiException.badRequest("code는 필수입니다.");
        }

        if (!ev.getCode().equals(code)) {
            throw ApiException.badRequest("인증 코드가 올바르지 않습니다.");
        }

        ev.setVerifiedAt(LocalDateTime.now());
        emailVerificationRepository.save(ev);
    }
}
