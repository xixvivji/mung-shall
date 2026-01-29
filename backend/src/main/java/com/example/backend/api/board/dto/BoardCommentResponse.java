package com.example.backend.api.board.dto;

import com.example.backend.domain.board.BoardComment;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public record BoardCommentResponse(
        Long id,
        Long parentCommentId,
        String writer,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<BoardCommentResponse> replies,
        long likeCount,
        boolean likedByMe
) {
    public static BoardCommentResponse of(BoardComment c, long likeCount, boolean likedByMe) {
        return new BoardCommentResponse(
                c.getId(),
                (c.getParentComment() == null) ? null : c.getParentComment().getId(),
                c.getWriter().getName(),
                c.getContent(),
                c.getCreatedAt(),
                c.getUpdatedAt(),
                new ArrayList<>(),
                likeCount,
                likedByMe
        );
    }
}
