package com.example.backend.api.auth;

import com.example.backend.api.auth.dto.EmailSendRequest;
import com.example.backend.api.auth.dto.EmailVerifyRequest;
import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private final EmailVerificationService emailVerificationService;
    private final AuthService authService;

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean available = authService.isUsernameAvailable(username);

        if (!available) {
            // 명세: 409 Conflict (이미 존재하는 아이디)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "이미 존재하는 아이디입니다."));
        }

        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);

        if (!available) {
            // 명세: 409 Conflict (이미 존재하는 이메일)
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "이미 사용 중인 이메일입니다."));
        }

        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    // 이메일 인증 코드 발송
    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailCode(@Valid @RequestBody EmailSendRequest request) {
        LocalDateTime expireTime = emailVerificationService.sendCode(request.getEmail(), request.getPurpose());
        return ResponseEntity.ok(Map.of("expireTime", expireTime.toString()));
    }

    // 이메일 인증 코드 검증
    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmailCode(@Valid @RequestBody EmailVerifyRequest request) {
        emailVerificationService.verifyCode(request.getEmail(), request.getPurpose(), request.getCode());
        return ResponseEntity.ok(Map.of("isVerified", true));
    }

    // 일반 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest request) {
        authService.signUp(request);
        return ResponseEntity.ok(Map.of("message", "Success"));
    }
}
