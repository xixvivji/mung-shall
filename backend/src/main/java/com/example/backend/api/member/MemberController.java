package com.example.backend.api.member;

import com.example.backend.api.member.dto.MemberUpdateRequest;
import com.example.backend.api.member.dto.MemberWithdrawRequest;
import com.example.backend.common.ApiException;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.MemberService;
import jakarta.validation.Valid;
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
    private final MemberService memberService;

    public MemberController(UserRepository userRepository, MemberService memberService) {
        this.userRepository = userRepository;
        this.memberService = memberService;
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
        body.put("username", me.getUsername());
        body.put("name", me.getName());
        body.put("phone", me.getPhone());
        body.put("email", me.getEmail());
        body.put("address", me.getAddress());
        body.put("loginType", resolveLoginType(me));

        return ResponseEntity.ok(body);
    }

    @PatchMapping("/me")
    @Transactional
    public ResponseEntity<?> updateMe(
            Authentication authentication,
            @RequestBody @Valid MemberUpdateRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        Long userId = Long.parseLong(authentication.getName());
        memberService.updateMe(userId, request);

        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> withdrawMe(
            Authentication authentication,
            @RequestBody(required = false) MemberWithdrawRequest request
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        Long userId = Long.parseLong(authentication.getName());

        // request가 null로 들어오는 경우도 있어서 방어
        if (request == null) request = new MemberWithdrawRequest();

        memberService.withdraw(userId, request);

        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    private String resolveLoginType(User user) {
        boolean isLocal = user.getUsername() != null && !user.getUsername().isBlank();
        return isLocal ? "LOCAL" : "SOCIAL";
    }
}
