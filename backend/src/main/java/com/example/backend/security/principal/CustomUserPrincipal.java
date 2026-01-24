package com.example.backend.security.principal;

import lombok.Getter;

@Getter
public class CustomUserPrincipal {
    private final Long userId;
    private final String username;

    public CustomUserPrincipal(Long userId, String username) {
        this.userId = userId;
        this.username = username;
    }
}
