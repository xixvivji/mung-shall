package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardCommentCreateRequest;
import com.example.backend.api.board.dto.BoardCommentUpdateRequest;
import com.example.backend.common.ApiException;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.BoardCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class BoardCommentController {

    private final BoardCommentService boardCommentService;

    // 댓글 작성 (댓글/대댓글)
    @PostMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long boardId,
            @RequestBody BoardCommentCreateRequest request
    ) {
        Long userId = getUserIdOr401();
        Long id = boardCommentService.createComment(userId, boardId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 목록
    @GetMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long boardId) {
        Long userId = null;

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (principalObj instanceof CustomUserPrincipal p) userId = p.getUserId();
        else if (principalObj instanceof String s) {
            try { userId = Long.parseLong(s); } catch (Exception ignored) {}
        } else if (principalObj instanceof Long l) userId = l;

        return ResponseEntity.ok(boardCommentService.getComments(userId, boardId));
    }


    // 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody BoardCommentUpdateRequest request
    ) {
        Long userId = getUserIdOr401();
        Long id = boardCommentService.updateComment(userId, commentId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
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
}
