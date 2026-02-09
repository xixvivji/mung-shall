package com.example.backend.service.recommendation.cache;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class EmbeddingCacheKeyFactory {

    private static final int SCHEMA_VERSION = 1;

    /** 모델명 -> 축약키 (원하면 여기만 늘리면 됨) */
    public String modelKey(String fullModelName) {
        if (fullModelName == null) return "unknown";
        return switch (fullModelName) {
            case "text-embedding-3-large" -> "te3l";
            case "text-embedding-3-small" -> "te3s";
            default -> normalize(fullModelName);
        };
    }

    /** 정규화 텍스트 hash (SHA-256 hex) */
    public String textHash(String normalizedText) {
        String canonical = canonicalize(normalizedText);
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(canonical.getBytes(StandardCharsets.UTF_8));
            return toHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to hash text", e);
        }
    }

    /** 임베딩 실키 */
    public String dogEmbeddingKey(long dogId, String modelKey, String textHash) {
        return "dog:emb:v" + SCHEMA_VERSION +
                ":dogId:" + dogId +
                ":model:" + modelKey +
                ":th:" + textHash;
    }

    /** latest 포인터 키 */
    public String dogEmbeddingLatestKey(long dogId, String modelKey) {
        return "dog:emb:latest:v" + SCHEMA_VERSION +
                ":dogId:" + dogId +
                ":model:" + modelKey;
    }

    /** 해시 입력 정규화(공백/개행 영향 제거) */
    public String canonicalize(String text) {
        if (text == null) return "";
        return text.trim().replaceAll("\\s+", " ");
    }

    private String normalize(String s) {
        return s.trim().toLowerCase().replaceAll("[^a-z0-9\\-]+", "");
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    /** vec 저장 키 (Value: byte[]) */
    public String dogEmbeddingVecKey(long dogId, String modelKey, String textHash) {
        return dogEmbeddingKey(dogId, modelKey, textHash) + ":vec";
    }

    /** meta 저장 키 (Hash: dim/model/th/ts 등 String) */
    public String dogEmbeddingMetaKey(long dogId, String modelKey, String textHash) {
        return dogEmbeddingKey(dogId, modelKey, textHash) + ":meta";
    }

}
