package com.example.backend.api.member.dto;

import com.example.backend.domain.user.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MemberMeResponse {
    private Long userId;
    private String username;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String loginType; // LOCAL / SOCIAL

    public static MemberMeResponse from(User user) {
        boolean isLocal = user.getUsername() != null && !user.getUsername().isBlank();

        return MemberMeResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .name(user.getName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(user.getAddress())
                .loginType(isLocal ? "LOCAL" : "SOCIAL")
                .build();
    }
}
