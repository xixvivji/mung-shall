package com.example.backend.security.jwt;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RefreshTokenRedisService {

    private final StringRedisTemplate redisTemplate;
    private final Duration refreshTtl;

    public RefreshTokenRedisService(
            StringRedisTemplate redisTemplate,
            @Value("${jwt.refresh-exp-days}") long refreshExpDays
    ) {
        this.redisTemplate = redisTemplate;
        this.refreshTtl = Duration.ofDays(refreshExpDays);
    }

    private String keyByToken(String refreshToken) {
        return "rt:" + refreshToken;
    }

    private String keyByUser(Long userId) {
        return "rt:user:" + userId;
    }

    public void save(Long userId, String refreshToken) {
        if (userId == null) return;
        if (refreshToken == null || refreshToken.isBlank()) return;

        String oldToken = redisTemplate.opsForValue().get(keyByUser(userId));
        if (oldToken != null && !oldToken.isBlank()) {
            redisTemplate.delete(keyByToken(oldToken));
        }

        redisTemplate.opsForValue().set(keyByToken(refreshToken), String.valueOf(userId), refreshTtl);
        redisTemplate.opsForValue().set(keyByUser(userId), refreshToken, refreshTtl);
    }

    public Long getUserIdIfValid(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return null;

        String v = redisTemplate.opsForValue().get(keyByToken(refreshToken));
        if (v == null || v.isBlank()) return null;

        try {
            return Long.parseLong(v);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public void delete(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return;

        Long userId = getUserIdIfValid(refreshToken);

        redisTemplate.delete(keyByToken(refreshToken));

        if (userId != null) {
            redisTemplate.delete(keyByUser(userId));
        }
    }

    public void deleteByUserId(Long userId) {
        if (userId == null) return;

        String token = redisTemplate.opsForValue().get(keyByUser(userId));
        if (token != null && !token.isBlank()) {
            redisTemplate.delete(keyByToken(token));
        }
        redisTemplate.delete(keyByUser(userId));
    }
}
