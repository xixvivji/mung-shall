package com.example.backend.service;

import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.common.ApiException;
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
        validateUsernameAvailable(request.getUsername());
        validateEmailAvailable(request.getEmail());

        EmailVerification verification = emailVerificationRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(request.getEmail(), "signup")
                .orElseThrow(() -> ApiException.badRequest("이메일 인증 기록이 없습니다."));

        if (verification.isExpired()) {
            throw ApiException.badRequest("이메일 인증이 만료되었습니다.");
        }

        if (!verification.isVerified()) {
            throw ApiException.badRequest("이메일 인증이 완료되지 않았습니다.");
        }

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

    public void validateUsernameAvailable(String username) {
        if (username == null || username.isBlank()) {
            throw ApiException.badRequest("username은 필수입니다.");
        }
        if (userRepository.existsByUsername(username)) {
            throw ApiException.conflict("이미 존재하는 아이디입니다.");
        }
    }

    public void validateEmailAvailable(String email) {
        if (email == null || email.isBlank()) {
            throw ApiException.badRequest("email은 필수입니다.");
        }
        if (userRepository.existsByEmail(email)) {
            throw ApiException.conflict("이미 사용 중인 이메일입니다.");
        }
    }

    public boolean isUsernameAvailable(String username) {
        validateUsernameAvailable(username);
        return true;
    }

    public boolean isEmailAvailable(String email) {
        validateEmailAvailable(email);
        return true;
    }
}
