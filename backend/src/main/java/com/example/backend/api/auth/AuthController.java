package com.example.backend.api.auth;

import com.example.backend.api.auth.dto.EmailSendRequest;
import com.example.backend.api.auth.dto.EmailVerifyRequest;
import com.example.backend.api.auth.dto.LoginRequest;
import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.security.jwt.JwtTokenProvider;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailVerificationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    private final EmailVerificationService emailVerificationService;
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.samesite:Lax}")
    private String cookieSameSite;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthService.LoginResult result = authService.login(request.getUsername(), request.getPassword());

        setRefreshCookie(response, result.getRefreshToken());

        return ResponseEntity.ok(Map.of("accessToken", result.getAccessToken()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refreshToken = readRefreshCookie(request);
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = readRefreshCookie(request);

        authService.logout(refreshToken);
        deleteRefreshCookie(response);

        return ResponseEntity.ok(Map.of("message", "logout"));
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        Duration ttl = jwtTokenProvider.getRefreshTtl();
        long maxAgeSecLong = ttl.getSeconds();
        int maxAgeSec = (maxAgeSecLong > Integer.MAX_VALUE) ? Integer.MAX_VALUE : (int) maxAgeSecLong;

        String sameSite = (cookieSameSite == null || cookieSameSite.isBlank()) ? "Lax" : cookieSameSite;

        String header = REFRESH_COOKIE_NAME + "=" + refreshToken
                + "; Path=/"
                + "; Max-Age=" + maxAgeSec
                + "; HttpOnly"
                + (cookieSecure ? "; Secure" : "")
                + "; SameSite=" + sameSite;

        response.setHeader("Set-Cookie", header);
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (REFRESH_COOKIE_NAME.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private void deleteRefreshCookie(HttpServletResponse response) {
        String sameSite = (cookieSameSite == null || cookieSameSite.isBlank()) ? "Lax" : cookieSameSite;

        String header = REFRESH_COOKIE_NAME + "=; Path=/; Max-Age=0; HttpOnly"
                + (cookieSecure ? "; Secure" : "")
                + "; SameSite=" + sameSite;

        response.setHeader("Set-Cookie", header);
    }
}
