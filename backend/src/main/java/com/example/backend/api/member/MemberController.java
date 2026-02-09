package com.example.backend.api.member;

import com.example.backend.api.member.dto.MemberUpdateRequest;
import com.example.backend.api.member.dto.MemberWithdrawRequest;
import com.example.backend.common.ApiException;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "회원 API", description = "회원 정보 조회 및 수정 API")
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

    @Operation(summary = "내 정보 조회", description = "로그인된 사용자의 회원 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/me")
    public ResponseEntity<?> me(
            @Parameter(hidden = true)
            Authentication authentication
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Long userId = principal.getUserId();

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
        body.put("userType", me.getUserType());

        return ResponseEntity.ok(body);
    }

    @Operation(summary = "내 정보 수정", description = "로그인된 사용자의 회원 정보를 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PatchMapping("/me")
    @Transactional
    public ResponseEntity<?> updateMe(
            @Parameter(hidden = true)
            Authentication authentication,
            @RequestBody @Valid MemberUpdateRequest request
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Long userId = principal.getUserId();

        memberService.updateMe(userId, request);

        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    @Operation(summary = "회원 탈퇴", description = "로그인된 사용자의 회원 탈퇴를 진행합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "탈퇴 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @DeleteMapping("/me")
    @Transactional
    public ResponseEntity<?> withdrawMe(
            @Parameter(hidden = true)
            Authentication authentication,
            @RequestBody(required = false) MemberWithdrawRequest request
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
        Long userId = principal.getUserId();

        if (request == null) request = new MemberWithdrawRequest();

        memberService.withdraw(userId, request);

        return ResponseEntity.ok(Map.of("message", "Success"));
    }

    private String resolveLoginType(User user) {
        boolean isLocal = user.getUsername() != null && !user.getUsername().isBlank();
        return isLocal ? "LOCAL" : "SOCIAL";
    }
}
