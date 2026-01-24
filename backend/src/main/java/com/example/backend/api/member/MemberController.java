package com.example.backend.api.member;

import com.example.backend.common.ApiException;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@Transactional(readOnly = true)
public class MemberController {

    private final UserRepository userRepository;

    public MemberController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        Long userId = Long.parseLong(authentication.getName());

        User me = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Unauthorized"));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("userId", me.getUserId());
        body.put("username", me.getUsername()); // null이어도 OK (Map.of만 안 쓰면 됨)
        body.put("name", me.getName());
        body.put("phone", me.getPhone());
        body.put("email", me.getEmail());
        body.put("address", me.getAddress());
        body.put("loginType", resolveLoginType(me));

        return ResponseEntity.ok(body);
    }

    private String resolveLoginType(User user) {
        boolean isLocal = user.getUsername() != null && !user.getUsername().isBlank();
        return isLocal ? "LOCAL" : "SOCIAL";
    }
}
