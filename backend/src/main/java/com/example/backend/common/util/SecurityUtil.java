package com.example.backend.common.util;

import com.example.backend.security.principal.CustomUserPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil() { }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            return null;
        }

        return ((CustomUserPrincipal) authentication.getPrincipal()).getUserId();
    }
}
