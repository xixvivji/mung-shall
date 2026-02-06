package com.example.backend.repository.recommendation;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class EmbeddingCacheRepository {

    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${app.embedding.cache.ttl-seconds:2592000}")
    private long ttlSeconds;

    public boolean exists(String key) {
        Boolean has = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(has);
    }

    /** Hash에서 vec(byte[])만 꺼내기 */
    public byte[] getVector(String key) {
        Object v = redisTemplate.opsForHash().get(key, "vec");
        if (v == null) return null;
        if (v instanceof byte[] bytes) return bytes;

        // serializer 설정에 따라 byte[]가 아닌 형태로 들어오면 실패할 수 있음
        throw new IllegalStateException("Unexpected vec type in redis: " + v.getClass());
    }

    /** latest 포인터 읽기: value=실키(String) */
    public String getLatestPointer(String latestKey) {
        Object v = redisTemplate.opsForValue().get(latestKey);
        return (v == null) ? null : String.valueOf(v);
    }

    /** Hash 저장 + TTL */
    public void putEmbeddingHash(String key, byte[] vec, int dim, String modelKey, String textHash) {
        Map<String, Object> map = Map.of(
                "vec", vec,
                "dim", String.valueOf(dim),
                "model", modelKey,
                "th", textHash,
                "ts", String.valueOf(System.currentTimeMillis())
        );
        redisTemplate.opsForHash().putAll(key, map);
        redisTemplate.expire(key, Duration.ofSeconds(ttlSeconds));
    }

    /** latest 포인터 저장 + TTL */
    public void putLatestPointer(String latestKey, String actualKey) {
        redisTemplate.opsForValue().set(latestKey, actualKey, Duration.ofSeconds(ttlSeconds));
    }
}
