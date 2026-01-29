package com.example.backend.api.auth;

import com.example.backend.api.auth.dto.EmailSendRequest;
import com.example.backend.api.auth.dto.EmailVerifyRequest;
import com.example.backend.api.auth.dto.LoginRequest;
import com.example.backend.api.auth.dto.SignUpRequest;
import com.example.backend.security.jwt.JwtTokenProvider;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import com.example.backend.api.auth.dto.FindUsernameRequest;
import com.example.backend.api.auth.dto.PasswordResetRequest;
import com.example.backend.api.auth.dto.PasswordResetConfirmRequest;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "인증 API", description = "회원가입/로그인/토큰/이메일 인증 관련 API")
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

    @Operation(summary = "아이디 중복 확인", description = "username 사용 가능 여부를 확인합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "확인 성공"),
            @ApiResponse(responseCode = "400", description = "이미 사용 중인 아이디")
    })
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(
            @Parameter(description = "확인할 아이디(username)", required = true)
            @RequestParam String username
    ) {
        authService.validateUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    @Operation(summary = "이메일 중복 확인", description = "email 사용 가능 여부를 확인합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "확인 성공"),
            @ApiResponse(responseCode = "400", description = "이미 사용 중인 이메일")
    })
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(
            @Parameter(description = "확인할 이메일", required = true)
            @RequestParam String email
    ) {
        authService.validateEmailAvailable(email);
        return ResponseEntity.ok(Map.of("isAvailable", true));
    }

    @Operation(summary = "이메일 인증 코드 발송", description = "이메일로 인증 코드를 발송합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "발송 성공"),
            @ApiResponse(responseCode = "400", description = "요청값 오류")
    })
    @PostMapping("/email/send")
    public ResponseEntity<?> sendEmailCode(
            @Valid @RequestBody EmailSendRequest request
    ) {
        LocalDateTime expireTime = emailVerificationService.sendCode(request.getEmail(), request.getPurpose());
        return ResponseEntity.ok(Map.of("expireTime", expireTime.toString()));
    }

    @Operation(summary = "이메일 인증 코드 검증", description = "이메일 인증 코드를 검증합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "검증 성공"),
            @ApiResponse(responseCode = "400", description = "인증 코드 불일치/만료")
    })
    @PostMapping("/email/verify")
    public ResponseEntity<?> verifyEmailCode(
            @Valid @RequestBody EmailVerifyRequest request
    ) {
        emailVerificationService.verifyCode(request.getEmail(), request.getPurpose(), request.getCode());
        return ResponseEntity.ok(Map.of("isVerified", true));
    }

    @Operation(summary = "회원가입", description = "일반 회원가입을 진행합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "회원가입 성공"),
            @ApiResponse(responseCode = "400", description = "요청값 오류/중복")
    })
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        authService.signUp(request);
        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    @Operation(summary = "로그인", description = "아이디/비밀번호로 로그인하고 accessToken을 발급합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그인 성공"),
            @ApiResponse(responseCode = "401", description = "아이디 또는 비밀번호 불일치")
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthService.LoginResult result = authService.login(request.getUsername(), request.getPassword());

        setRefreshCookie(response, result.getRefreshToken());

        return ResponseEntity.ok(Map.of("accessToken", result.getAccessToken()));
    }

    @Operation(summary = "소셜 로그인 시작", description = "소셜 로그인(provider) 인증 페이지로 리다이렉트합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "302", description = "리다이렉트 성공"),
            @ApiResponse(responseCode = "400", description = "지원하지 않는 provider")
    })
    @GetMapping("/oauth/{provider}")
    public ResponseEntity<Void> oauthStart(
            @Parameter(description = "소셜 provider (google/naver/kakao)", required = true)
            @PathVariable String provider
    ) {

        if (!("google".equals(provider) || "naver".equals(provider) || "kakao".equals(provider))) {
            return ResponseEntity.badRequest().build();
        }

        String target = "/oauth2/authorization/" + provider;

        return ResponseEntity.status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, target)
                .build();
    }

    @Operation(summary = "토큰 재발급", description = "refreshToken으로 accessToken을 재발급합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "재발급 성공"),
            @ApiResponse(responseCode = "401", description = "refreshToken 없음/만료/무효")
    })
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        String refreshToken = readRefreshCookie(request);
        String newAccessToken = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
    }

    @Operation(summary = "로그아웃", description = "로그아웃하고 refreshToken을 제거합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
            @ApiResponse(responseCode = "401", description = "refreshToken 없음/무효")
    })
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

    @Operation(summary = "아이디 찾기", description = "이메일로 username을 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "해당 이메일의 사용자를 찾을 수 없음")
    })
    @PostMapping("/find-username")
    public ResponseEntity<?> findUsername(
            @Valid @RequestBody FindUsernameRequest request
    ) {
        String username = authService.findUsernameByEmail(request.getEmail());
        return ResponseEntity.ok(Map.of("username", username));
    }

    @Operation(summary = "비밀번호 재설정 요청", description = "비밀번호 재설정 링크(또는 토큰) 발급을 요청합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "요청 성공"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @PostMapping("/password/reset")
    public ResponseEntity<?> passwordReset(
            @Valid @RequestBody PasswordResetRequest request
    ) {
        authService.requestPasswordReset(request.getUsername(), request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Reset link sent"));
    }

    @Operation(summary = "비밀번호 재설정 확정", description = "토큰을 검증하고 새 비밀번호로 변경합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 성공"),
            @ApiResponse(responseCode = "400", description = "토큰 만료/무효"),
            @ApiResponse(responseCode = "404", description = "토큰을 찾을 수 없음")
    })
    @PostMapping("/password/reset/confirm")
    public ResponseEntity<?> passwordResetConfirm(
            @Valid @RequestBody PasswordResetConfirmRequest request
    ) {
        authService.confirmPasswordReset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Success"));
    }
}
