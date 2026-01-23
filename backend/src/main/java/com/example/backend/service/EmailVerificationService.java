package com.example.backend.service;

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

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
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

        EmailVerification ev = emailVerificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new IllegalArgumentException("인증 코드가 올바르지 않습니다."));

        if (ev.isExpired()) {
            throw new IllegalArgumentException("인증 코드가 만료되었습니다.");
        }

        if (!ev.getCode().equals(code)) {
            throw new IllegalArgumentException("인증 코드가 올바르지 않습니다.");
        }

        ev.setVerifiedAt(LocalDateTime.now());
        // @Transactional이라 save 없어도 반영되지만, 명시적으로 저장해도 됨
        emailVerificationRepository.save(ev);
    }
}
