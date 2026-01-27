package com.example.backend.security.principal;

import com.example.backend.domain.user.UserType;
import lombok.Getter;

@Getter
public class CustomUserPrincipal {
    private final Long userId;
    private final String username;
    private final UserType userType;

    public CustomUserPrincipal(Long userId, String username, UserType userType) {
        this.userId = userId;
        this.username = username;
        this.userType = userType;
    }
}
