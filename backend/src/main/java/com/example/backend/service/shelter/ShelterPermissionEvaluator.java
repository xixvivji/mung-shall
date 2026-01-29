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

// 대대적 로직 개선 요망...
@Component
@RequiredArgsConstructor
public class ShelterPermissionEvaluator {

    private final ShelterRepository shelterRepository;

    /**
     * 현재 로그인된 사용자(보호소 관리자)의 Principal을 가져옵니다.
     * 인증 및 사용자 유형 검증을 포함합니다.
     * @return CustomUserPrincipal 로그인된 보호소 관리자 Principal
     * @throws SecurityException 인증되지 않았거나 보호소 관리자가 아닌 경우
     */
    private CustomUserPrincipal getAuthenticatedShelterPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserPrincipal)) {
            throw new SecurityException("인증되지 않은 사용자입니다.");
        }
        CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();

        if (principal.getUserType() != UserType.shelter) {
            throw new SecurityException("보호소 관리자만 이 작업을 수행할 수 있습니다.");
        }
        return principal;
    }

    /**
     * 주어진 CustomUserPrincipal에 해당하는 보호소 엔티티를 가져옵니다.
     * @param principal CustomUserPrincipal
     * @return 해당 사용자에 매칭되는 Shelter 엔티티
     * @throws IllegalArgumentException 로그인된 사용자에 매칭되는 보호소가 없는 경우
     */
    private Shelter getShelterFromPrincipal(CustomUserPrincipal principal) {
        return shelterRepository.findByUserUserId(principal.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("로그인된 사용자에 매칭되는 보호소가 없습니다."));
    }

    /**
     * 현재 로그인된 사용자(보호소 관리자)의 보호소 정보를 가져옵니다.
     * @return 로그인된 사용자에 매칭되는 Shelter 엔티티
     */
    public Shelter getLoggedInShelter() {
        CustomUserPrincipal principal = getAuthenticatedShelterPrincipal();
        return getShelterFromPrincipal(principal);
    }


    public void checkShelterPermission(AbandonedDog dog) {
        CustomUserPrincipal principal = getAuthenticatedShelterPrincipal();
        Shelter shelter = getShelterFromPrincipal(principal);

        if (!Objects.equals(shelter.getShelterRegNo(), dog.getCareRegNo())) {
            throw new SecurityException("해당 입양 건을 처리할 권한이 없습니다. (강아지 소속 보호소 불일치)");
        }
    }
    
    public void checkShelterOwnership(Long shelterId) {
        CustomUserPrincipal principal = getAuthenticatedShelterPrincipal();
        Shelter loggedInShelter = getShelterFromPrincipal(principal);

        if (!Objects.equals(loggedInShelter.getId(), shelterId)) {
            throw new SecurityException("요청한 보호소 ID에 대한 권한이 없습니다.");
        }
    }
}
