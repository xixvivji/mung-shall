package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisEmbeddingCacheConfig {

    @Bean
    public StringRedisTemplate embeddingStringRedisTemplate(RedisConnectionFactory cf) {
        return new StringRedisTemplate(cf);
    }

    @Bean
    public RedisTemplate<String, byte[]> embeddingVectorRedisTemplate(RedisConnectionFactory cf) {
        RedisTemplate<String, byte[]> t = new RedisTemplate<>();
        t.setConnectionFactory(cf);

        StringRedisSerializer keySer = new StringRedisSerializer();
        RedisSerializer<byte[]> valSer = RedisSerializer.byteArray();

        t.setKeySerializer(keySer);
        t.setValueSerializer(valSer);
        t.setHashKeySerializer(keySer);
        t.setHashValueSerializer(valSer);

        t.afterPropertiesSet();
        return t;
    }

}
