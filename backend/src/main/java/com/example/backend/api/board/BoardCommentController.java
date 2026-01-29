package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardCommentCreateRequest;
import com.example.backend.api.board.dto.BoardCommentUpdateRequest;
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

    // 댓글 작성
    @PostMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> createComment(
            @PathVariable Long boardId,
            @RequestBody BoardCommentCreateRequest request
    ) {
        CustomUserPrincipal principal = getPrincipalOr401();
        Long id = boardCommentService.createComment(principal.getUserId(), boardId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 목록
    @GetMapping("/boards/{boardId}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long boardId) {
        return ResponseEntity.ok(boardCommentService.getComments(boardId));
    }

    // 댓글 수정
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long commentId,
            @RequestBody BoardCommentUpdateRequest request
    ) {
        CustomUserPrincipal principal = getPrincipalOr401();
        Long id = boardCommentService.updateComment(principal.getUserId(), commentId, request);
        return ResponseEntity.ok(Map.of("commentId", id));
    }

    // 댓글 삭제
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        CustomUserPrincipal principal = getPrincipalOr401();
        boardCommentService.deleteComment(principal.getUserId(), commentId);
        return ResponseEntity.noContent().build();
    }

    private CustomUserPrincipal getPrincipalOr401() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            throw com.example.backend.common.ApiException.unauthorized("로그인이 필요합니다.");
        }
        return principal;
    }
}
