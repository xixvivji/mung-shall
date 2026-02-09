package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardCommentCreateRequest;
import com.example.backend.api.board.dto.BoardCommentUpdateRequest;
import com.example.backend.common.ApiException;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.BoardCommentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.BoardCommentLikeService;

import java.util.Map;

@Tag(name = "댓글 API", description = "게시글 댓글 관련 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;
    private final BoardCommentLikeService boardCommentLikeService;

    // 댓글 작성 (댓글/대댓글)
    @Operation(summary = "댓글 작성", description = "게시글에 댓글(대댓글 포함)을 작성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "작성 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "게시글 또는 부모 댓글을 찾을 수 없음")
    })
    @PostMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> createComment(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long boardId,
            @RequestBody BoardCommentCreateRequest request
    ) {
        Long userId = getUserIdOr401();
        Long id = boardCommentService.createComment(userId, boardId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 목록
    @Operation(summary = "댓글 목록 조회", description = "특정 게시글의 댓글 목록을 페이지네이션하여 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @GetMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> getComments(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long boardId,
            @Parameter(description = "페이지 번호 (0부터 시작)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기")
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (principalObj instanceof CustomUserPrincipal p) userId = p.getUserId();
        else if (principalObj instanceof String s) {
            try { userId = Long.parseLong(s); } catch (Exception ignored) {}
        } else if (principalObj instanceof Long l) userId = l;

        return ResponseEntity.ok(boardCommentService.getCommentsPaged(userId, boardId, page, size));
    }

    // 댓글 수정
    @Operation(summary = "댓글 수정", description = "특정 댓글의 내용을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @Parameter(description = "댓글 ID", required = true)
            @PathVariable Long commentId,
            @RequestBody BoardCommentUpdateRequest request
    ) {
        Long userId = getUserIdOr401();
        Long id = boardCommentService.updateComment(userId, commentId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 삭제
    @Operation(summary = "댓글 삭제", description = "특정 댓글을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @Parameter(description = "댓글 ID", required = true)
            @PathVariable Long commentId
    ) {
        Long userId = getUserIdOr401();
        boardCommentService.deleteComment(userId, commentId);
        return ResponseEntity.noContent().build();
    }

    private Long getUserIdOr401() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (principalObj instanceof CustomUserPrincipal p) {
            return p.getUserId();
        }

        if (principalObj instanceof String s) {
            try {
                return Long.parseLong(s);
            } catch (NumberFormatException e) {
                throw ApiException.unauthorized("로그인이 필요합니다.");
            }
        }

        if (principalObj instanceof Long l) {
            return l;
        }

        throw ApiException.unauthorized("로그인이 필요합니다.");
    }

    @Operation(summary = "댓글 좋아요 토글", description = "특정 댓글에 좋아요를 누르거나 다시 누르면 취소합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "토글 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음")
    })
    @PostMapping("/comments/{commentId}/likes")
    public ResponseEntity<?> toggleCommentLike(
            @Parameter(description = "댓글 ID", required = true)
            @PathVariable Long commentId
    ) {
        Long userId = getUserIdOr401();
        var result = boardCommentLikeService.toggle(userId, commentId);
        return ResponseEntity.ok(Map.of(
                "liked", result.liked(),
                "likeCount", result.likeCount()
        ));
    }

}
