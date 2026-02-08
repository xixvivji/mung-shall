package com.example.backend.service.recommendation.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationCacheService {

    private static final String KEY_PREFIX = "rec:dog:user:";

    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.recommendation.cache.ttl-seconds:86400}")
    private long ttlSeconds;

    private Duration ttl() {
        return Duration.ofSeconds(ttlSeconds);
    }

    private String key(Long userId) {
        return KEY_PREFIX + userId;
    }

    public RecommendationCacheEntry get(Long userId) {
        String raw = stringRedisTemplate.opsForValue().get(key(userId));
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(raw, RecommendationCacheEntry.class);
        } catch (JsonProcessingException ex) {
            log.warn("Failed to parse recommendation cache for userId={}", userId, ex);
            return null;
        }
    }

    public void save(Long userId, RecommendationCacheEntry entry) {
        try {
            String raw = objectMapper.writeValueAsString(entry);
            stringRedisTemplate.opsForValue().set(key(userId), raw, ttl());
        } catch (JsonProcessingException ex) {
            log.warn("Failed to store recommendation cache for userId={}", userId, ex);
        }
    }

    public void saveIfNewer(Long userId, RecommendationCacheEntry entry) {
        RecommendationCacheEntry current = get(userId);
        if (current != null
                && current.surveyUpdatedAt() != null
                && entry.surveyUpdatedAt() != null
                && current.surveyUpdatedAt().isAfter(entry.surveyUpdatedAt())) {
            return;
        }
        save(userId, entry);
    }

    public void evict(Long userId) {
        stringRedisTemplate.delete(key(userId));
    }
}
