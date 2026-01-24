package com.example.backend.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessExpMs;
    private final long refreshExpMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-exp-min}") long accessExpMin,
            @Value("${jwt.refresh-exp-days}") long refreshExpDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMs = accessExpMin * 60_000L;
        this.refreshExpMs = refreshExpDays * 24L * 60L * 60L * 1000L;
    }

    public String createAccessToken(Long userId, String username) {
        return createToken(userId, username, accessExpMs);
    }

    public String createRefreshToken(Long userId, String username) {
        return createToken(userId, username, refreshExpMs);
    }

    public Duration getRefreshTtl() {
        return Duration.ofMillis(refreshExpMs);
    }

    public Duration getAccessTtl() {
        return Duration.ofMillis(accessExpMs);
    }

    private String createToken(Long userId, String username, long expMs) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("username", username)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key)
                .compact();
    }

    public String getUsername(String token) {
        Claims claims = parseClaims(token);
        Object v = claims.get("username");
        return v == null ? null : String.valueOf(v);
    }

    public Long getUserId(String token) {
        Claims claims = parseClaims(token);
        String sub = claims.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new IllegalArgumentException("Token subject (userId) is missing");
        }
        return Long.parseLong(sub);
    }

    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token is empty");
        }

        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException e) {
            throw new IllegalArgumentException("Invalid token", e);
        }
    }
}
