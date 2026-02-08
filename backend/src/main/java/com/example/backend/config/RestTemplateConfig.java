package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    @Primary
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public RestTemplate aiRestTemplate(
            RestTemplateBuilder builder,
            @Value("${app.ai.connect-timeout-ms}") long connectTimeoutMs,
            @Value("${app.ai.read-timeout-ms}") long readTimeoutMs
    ) {
        return builder
                .requestFactory(() -> {
                    SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
                    factory.setConnectTimeout(Math.toIntExact(Duration.ofMillis(connectTimeoutMs).toMillis()));
                    factory.setReadTimeout(Math.toIntExact(Duration.ofMillis(readTimeoutMs).toMillis()));
                    return factory;
                })
                .build();
    }
}
