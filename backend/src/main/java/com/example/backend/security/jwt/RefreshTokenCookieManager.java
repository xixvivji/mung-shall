package com.example.backend.security.jwt;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCookieManager {

    public static final String COOKIE_NAME = "refreshToken";

    private final boolean secure;
    private final String sameSite;

    public RefreshTokenCookieManager(
            @Value("${app.cookie.secure:false}") boolean secure,
            @Value("${app.cookie.samesite:Lax}") String sameSite
    ) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public void set(HttpServletResponse response, String refreshToken, int maxAgeSeconds) {
        // SameSite를 주려면 Set-Cookie 헤더를 직접 써야 하는데,
        // 여기서는 가장 호환 좋은 방식으로 "헤더 직접"을 사용한다.
        String cookie = COOKIE_NAME + "=" + refreshToken
                + "; Path=/"
                + "; Max-Age=" + maxAgeSeconds
                + "; HttpOnly"
                + (secure ? "; Secure" : "")
                + "; SameSite=" + sameSite;

        response.addHeader("Set-Cookie", cookie);
    }

    public void clear(HttpServletResponse response) {
        String cookie = COOKIE_NAME + "=; Path=/; Max-Age=0; HttpOnly"
                + (secure ? "; Secure" : "")
                + "; SameSite=" + sameSite;

        response.addHeader("Set-Cookie", cookie);
    }

    public String get(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (COOKIE_NAME.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
