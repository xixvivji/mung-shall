package com.example.backend.security;

import com.example.backend.domain.postadoption.PostAdoption;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.security.principal.CustomUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("postAdoptionSecurity")
@RequiredArgsConstructor
public class PostAdoptionSecurity {

    private final PostAdoptionRepository postAdoptionRepository;

    public boolean isOwner(Authentication authentication, Long postAdoptionId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof CustomUserPrincipal)) {
            // Handle cases where the principal is not the expected type, e.g., anonymousUser
            return false;
        }

        Long currentUserId = ((CustomUserPrincipal) principal).getUserId();
        if (currentUserId == null) {
            return false;
        }

        PostAdoption postAdoption = postAdoptionRepository.findById(postAdoptionId)
                .orElse(null);

        if (postAdoption == null) {
            // Or throw an exception, depending on desired behavior for non-existent entities
            return false;
        }

        // Check if the current user is the adopter associated with the post-adoption process
        return postAdoption.getAdoption().getUser().getUserId().equals(currentUserId);
    }
}
