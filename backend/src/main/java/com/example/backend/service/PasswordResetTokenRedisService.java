package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
public class PasswordResetTokenRedisService {

    private final StringRedisTemplate redisTemplate;
    private final Duration ttl;

    public PasswordResetTokenRedisService(
            StringRedisTemplate redisTemplate,
            @Value("${app.password-reset-ttl-min:15}") long ttlMinutes
    ) {
        this.redisTemplate = redisTemplate;
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    private String key(String token) {
        return "pwdreset:" + token;
    }

    public String createToken(Long userId) {
        String token = UUID.randomUUID().toString().replace("-", "");
        redisTemplate.opsForValue().set(key(token), String.valueOf(userId), ttl);
        return token;
    }

    public Long getUserId(String token) {
        String v = redisTemplate.opsForValue().get(key(token));
        if (v == null || v.isBlank()) return null;
        try {
            return Long.parseLong(v);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public void delete(String token) {
        redisTemplate.delete(key(token));
    }
}
