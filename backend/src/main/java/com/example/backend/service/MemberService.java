package com.example.backend.service;

import com.example.backend.api.member.dto.MemberMeResponse;
import com.example.backend.common.ApiException;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemberService {

    private final UserRepository userRepository;

    public MemberMeResponse getMe(Long userId) {
        if (userId == null) {
            throw ApiException.unauthorized("Unauthorized");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("회원 없음"));

        return MemberMeResponse.from(user);
    }
}
