package com.example.backend.api.dog.interest;

import com.example.backend.api.dog.dto.DogSummaryResponse;
import com.example.backend.common.util.SecurityUtil;
import com.example.backend.service.dog.interest.UserDogInterestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Tag(name = "관심 강아지", description = "사용자가 관심 있는 강아지(좋아요) 관련 API")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserDogInterestController {

    private final UserDogInterestService userDogInterestService;

    @Operation(summary = "강아지 좋아요 등록", description = "사용자가 특정 강아지에 대해 좋아요를 등록합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "좋아요 등록 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "강아지 ID를 찾을 수 없음")
    })
    @PostMapping("/dogs/{dogId}/like")
    public ResponseEntity<?> likeDog(
            @PathVariable Long dogId,
            @Parameter(hidden = true) Authentication authentication) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증되지 않은 사용자입니다."));
        }
        userDogInterestService.likeDog(currentUserId, dogId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(summary = "강아지 좋아요 취소", description = "사용자가 특정 강아지에 등록한 좋아요를 취소합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "좋아요 취소 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "강아지 ID를 찾을 수 없음")
    })
    @DeleteMapping("/dogs/{dogId}/like")
    public ResponseEntity<?> unlikeDog(
            @PathVariable Long dogId,
            @Parameter(hidden = true) Authentication authentication) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증되지 않은 사용자입니다."));
        }
        userDogInterestService.unlikeDog(currentUserId, dogId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "좋아요한 강아지 목록 조회", description = "사용자가 좋아요한 모든 강아지를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "좋아요한 강아지 목록 조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @GetMapping("/members/me/liked-dogs")
    public ResponseEntity<?> getLikedDogs(@Parameter(hidden = true) Authentication authentication) {
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "인증되지 않은 사용자입니다."));
        }
        List<DogSummaryResponse> likedDogs = userDogInterestService.getLikedDogs(currentUserId).stream()
                .map(DogSummaryResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(likedDogs);
    }
}

