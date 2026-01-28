package com.example.backend.security.oauth;

import com.example.backend.domain.auth.AuthProvider;
import com.example.backend.domain.auth.AuthUser;
import com.example.backend.domain.user.User;
import com.example.backend.domain.user.UserType;
import com.example.backend.repository.AuthUserRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.jwt.JwtTokenProvider;
import com.example.backend.security.jwt.RefreshTokenRedisService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final String REFRESH_COOKIE_NAME = "refreshToken";

    @Value("${app.front-oauth-redirect-url}")
    private String frontRedirectUrl;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.samesite:Lax}")
    private String cookieSameSite;

    private final UserRepository userRepository;
    private final AuthUserRepository authUserRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRedisService refreshTokenRedisService;

    public OAuth2AuthenticationSuccessHandler(
            UserRepository userRepository,
            AuthUserRepository authUserRepository,
            JwtTokenProvider jwtTokenProvider,
            RefreshTokenRedisService refreshTokenRedisService
    ) {
        this.userRepository = userRepository;
        this.authUserRepository = authUserRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenRedisService = refreshTokenRedisService;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String providerStr = (String) oAuth2User.getAttributes().get("provider"); // google/kakao/naver
        String providerUserId = (String) oAuth2User.getAttributes().get("providerUserId");
        String email = (String) oAuth2User.getAttributes().get("email");

        if (email == null || email.isBlank()) {
            redirectError(response, "EMAIL_REQUIRED", "이메일 제공 동의가 필요합니다.");
            return;
        }

        AuthProvider provider = toAuthProvider(providerStr);

        if (providerUserId == null || providerUserId.isBlank()) {
            redirectError(response, "PROVIDER_ID_MISSING", "소셜 사용자 식별값이 없습니다.");
            return;
        }

        Optional<AuthUser> existAuthUser =
                authUserRepository.findByProviderAndOauthId(provider, providerUserId);

        User user;

        if (existAuthUser.isPresent()) {
            user = existAuthUser.get().getUser();
        } else {
            if (userRepository.existsByEmail(email)) {
                redirectError(response, "EMAIL_ALREADY_EXISTS",
                        "이미 가입된 이메일입니다. 일반 로그인으로 진행해주세요.");
                return;
            }

            user = new User();
            user.setEmail(email);

            String name = extractName(oAuth2User, providerStr, email);
            user.setName(name);

            user.setUsername(null);
            user.setPassword(null);

            user.setUserType(UserType.adopter);
            user.setIsEmailVerified(true);

            user = userRepository.save(user);

            AuthUser authUser = new AuthUser();
            authUser.setUser(user);
            authUser.setProvider(provider);
            authUser.setOauthId(providerUserId);
            authUserRepository.save(authUser);
        }

        String usernameForToken = (user.getUsername() != null && !user.getUsername().isBlank())
                ? user.getUsername()
                : user.getEmail();

        String accessToken = jwtTokenProvider.createAccessToken(user.getUserId(), usernameForToken, user.getUserType());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUserId(), usernameForToken, user.getUserType());

        refreshTokenRedisService.save(user.getUserId(), refreshToken);

        setRefreshCookie(response, refreshToken);

        String redirectUrl = frontRedirectUrl
                + "?accessToken=" + URLEncoder.encode(accessToken, StandardCharsets.UTF_8)
                + "&provider=" + URLEncoder.encode(providerStr, StandardCharsets.UTF_8);

        response.sendRedirect(redirectUrl);
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

    private AuthProvider toAuthProvider(String providerStr) {
        if (providerStr == null) throw new IllegalArgumentException("provider is null");
        return switch (providerStr.toLowerCase()) {
            case "google" -> AuthProvider.GOOGLE;
            case "kakao" -> AuthProvider.KAKAO;
            case "naver" -> AuthProvider.NAVER;
            default -> throw new IllegalArgumentException("Unsupported provider: " + providerStr);
        };
    }

    private void redirectError(HttpServletResponse response, String code, String message) throws IOException {
        String url = frontRedirectUrl
                + "?error=" + URLEncoder.encode(code, StandardCharsets.UTF_8)
                + "&message=" + URLEncoder.encode(message, StandardCharsets.UTF_8);
        response.sendRedirect(url);
    }

    private String extractName(OAuth2User oAuth2User, String provider, String email) {
        try {
            if ("google".equalsIgnoreCase(provider)) {
                Object name = oAuth2User.getAttributes().get("name");
                if (name != null && !String.valueOf(name).isBlank()) return String.valueOf(name);
            }
            if ("kakao".equalsIgnoreCase(provider)) {
                Object kakaoAccountObj = oAuth2User.getAttributes().get("kakao_account");
                if (kakaoAccountObj instanceof java.util.Map<?, ?> kakaoAccount) {
                    Object profileObj = kakaoAccount.get("profile");
                    if (profileObj instanceof java.util.Map<?, ?> profile) {
                        Object nickname = profile.get("nickname");
                        if (nickname != null && !String.valueOf(nickname).isBlank()) return String.valueOf(nickname);
                    }
                }
            }
            if ("naver".equalsIgnoreCase(provider)) {
                Object respObj = oAuth2User.getAttributes().get("response");
                if (respObj instanceof java.util.Map<?, ?> resp) {
                    Object name = resp.get("name");
                    if (name != null && !String.valueOf(name).isBlank()) return String.valueOf(name);
                }
            }
        } catch (Exception ignore) {}

        int at = email.indexOf("@");
        return (at > 0) ? email.substring(0, at) : email;
    }
}
