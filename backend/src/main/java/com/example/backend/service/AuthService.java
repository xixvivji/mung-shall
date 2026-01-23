package com.example.backend.service;

import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.domain.auth.EmailVerification;
import com.example.backend.domain.user.User;
import com.example.backend.domain.user.UserType;
import com.example.backend.repository.EmailVerificationRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordEncoder passwordEncoder;

    public void signUp(SignUpRequest request) {

        // username 중복 체크
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        // email 중복 체크 (소셜 포함)
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        // 이메일 인증 기록 확인
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(
                        request.getEmail(), "signup"
                )
                .orElseThrow(() -> new IllegalArgumentException("이메일 인증 기록이 없습니다."));

        if (verification.isExpired()) {
            throw new IllegalArgumentException("이메일 인증이 만료되었습니다.");
        }

        if (!verification.isVerified()) {
            throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
        }

        // User 생성
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setUserType(UserType.adopter);
        user.setIsEmailVerified(true);

        userRepository.save(user);
    }

    // 아이디 중복 확인
    public boolean isUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("username은 필수입니다.");
        }
        return !userRepository.existsByUsername(username);
    }

    // 이메일 중복 확인
    public boolean isEmailAvailable(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email은 필수입니다.");
        }
        return !userRepository.existsByEmail(email);
    }
}
