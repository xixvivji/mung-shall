package com.example.backend.security.principal;

import com.example.backend.domain.user.UserType;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class CustomUserPrincipal implements UserDetails {
    private final Long userId;
    private final String username;
    private final UserType userType;

    public CustomUserPrincipal(Long userId, String username, UserType userType) {
        this.userId = userId;
        this.username = username;
        this.userType = userType;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userType.name().toUpperCase()));
    }

    @Override
    public String getPassword() {
        return null; // Passwords are not stored in the principal for JWT-based auth
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
