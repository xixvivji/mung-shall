package com.example.backend.api.auth;

import com.example.backend.api.auth.dto.EmailSendRequest;
import com.example.backend.api.auth.dto.EmailVerifyRequest;
import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
        authService.validateUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        authService.validateEmailAvailable(email);
        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailCode(@Valid @RequestBody EmailSendRequest request) {
        LocalDateTime expireTime = emailVerificationService.sendCode(request.getEmail(), request.getPurpose());
        return ResponseEntity.ok(Map.of("expireTime", expireTime.toString()));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmailCode(@Valid @RequestBody EmailVerifyRequest request) {
        emailVerificationService.verifyCode(request.getEmail(), request.getPurpose(), request.getCode());
        return ResponseEntity.ok(Map.of("isVerified", true));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@Valid @RequestBody SignUpRequest request) {
        authService.signUp(request);
        return ResponseEntity.ok(Map.of("message", "Success"));
    }
}
