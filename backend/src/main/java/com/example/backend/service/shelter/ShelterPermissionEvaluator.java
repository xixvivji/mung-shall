package com.example.backend.service.shelter;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.shelter.Shelter;
import com.example.backend.domain.user.UserType;
import com.example.backend.repository.shelter.ShelterRepository;
import com.example.backend.security.principal.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Objects;

// 메서드 다소 중복됨 수정 요망
@Component
@RequiredArgsConstructor
public class ShelterPermissionEvaluator {

    private final ShelterRepository shelterRepository;

    public void checkShelterPermission(AbandonedDog dog) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        if (principal.getUserType() != UserType.shelter) {
            throw new SecurityException("보호소 관리자만 이 작업을 수행할 수 있습니다.");
        }

        Shelter shelter = shelterRepository.findByUserUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자에 매칭되는 보호소가 없습니다."));

        if (!Objects.equals(shelter.getShelterRegNo(), dog.getCareRegNo())) {
            throw new SecurityException("해당 입양 건을 처리할 권한이 없습니다. (강아지 소속 보호소 불일치)");
        }
    }
    
    public void checkShelterOwnership(Long shelterId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        if (principal.getUserType() != UserType.shelter) {
            throw new SecurityException("보호소 관리자만 이 작업을 수행할 수 있습니다.");
        }

        Shelter loggedInShelter = shelterRepository.findByUserUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자에 매칭되는 보호소가 없습니다."));

        if (!Objects.equals(loggedInShelter.getId(), shelterId)) {
            throw new SecurityException("요청한 보호소 ID에 대한 권한이 없습니다.");
        }
    }
}
