package com.example.backend.service;

import com.example.backend.api.member.dto.MemberMeResponse;
import com.example.backend.api.member.dto.MemberUpdateRequest;
import com.example.backend.api.member.dto.MemberWithdrawRequest;
import com.example.backend.common.ApiException;
import com.example.backend.domain.user.User;
import com.example.backend.repository.AuthUserRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final AuthUserRepository authUserRepository;

    public MemberMeResponse getMe(Long userId) {
        if (userId == null) throw ApiException.unauthorized("Unauthorized");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("회원 없음"));

        return MemberMeResponse.from(user);
    }

    @Transactional
    public void updateMe(Long userId, MemberUpdateRequest req) {
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        if (req == null) throw ApiException.badRequest("Bad Request");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Unauthorized"));

        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());

        userRepository.save(user);
    }

    @Transactional
    public void withdraw(Long userId, MemberWithdrawRequest req) {
        if (userId == null) throw ApiException.unauthorized("Unauthorized");
        if (req == null) throw ApiException.badRequest("Bad Request");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Unauthorized"));

        boolean isLocal = user.getUsername() != null && !user.getUsername().isBlank();

        if (isLocal) {
            String raw = req.getPassword();
            if (raw == null || raw.isBlank()) {
                throw ApiException.badRequest("비밀번호를 입력해주세요.");
            }

            if (user.getPassword() == null || user.getPassword().isBlank()
                    || !passwordEncoder.matches(raw, user.getPassword())) {
                throw ApiException.badRequest("비밀번호 불일치");
            }
        }

        authUserRepository.deleteByUserUserId(userId);

        userRepository.delete(user);
    }
}
