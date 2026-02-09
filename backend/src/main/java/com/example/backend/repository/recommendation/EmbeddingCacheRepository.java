package com.example.backend.repository.recommendation;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class EmbeddingCacheRepository {

    private final RedisTemplate<String, byte[]> vectorRedis;   // vec 전용
    private final StringRedisTemplate stringRedis;             // meta/latest 전용

    @Value("${app.embedding.cache.ttl-seconds:2592000}")
    private long ttlSeconds;

    private Duration ttl() {
        return Duration.ofSeconds(ttlSeconds);
    }

    // -----------------------
    // Vector (Value: byte[])
    // -----------------------

    public byte[] getVector(String vecKey) {
        return vectorRedis.opsForValue().get(vecKey);
    }

    public void putVector(String vecKey, byte[] vec) {
        vectorRedis.opsForValue().set(vecKey, vec, ttl());
    }

    public boolean existsVector(String vecKey) {
        Boolean has = vectorRedis.hasKey(vecKey);
        return Boolean.TRUE.equals(has);
    }

    // -----------------------
    // Latest pointer (Value: String)
    // -----------------------

    public String getLatestPointer(String latestKey) {
        return stringRedis.opsForValue().get(latestKey);
    }

    public void putLatestPointer(String latestKey, String vecKey) {
        stringRedis.opsForValue().set(latestKey, vecKey, ttl());
    }

    // -----------------------
    // Meta (Hash: String->String)
    // -----------------------

    public void putMetaHash(String metaKey, int dim, String modelKey, String textHash) {
        Map<String, String> map = Map.of(
                "dim", String.valueOf(dim),
                "model", modelKey,
                "th", textHash,
                "ts", String.valueOf(System.currentTimeMillis())
        );
        stringRedis.opsForHash().putAll(metaKey, map);
        stringRedis.expire(metaKey, ttl());
    }
}
