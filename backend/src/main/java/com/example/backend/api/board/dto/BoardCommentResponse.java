package com.example.backend.api.board.dto;

import com.example.backend.domain.board.BoardComment;

import java.time.LocalDateTime;

public record BoardCommentResponse(
        Long id,
        Long writerId,
        String writerName,
        String content,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static BoardCommentResponse from(BoardComment c) {
        return new BoardCommentResponse(
                c.getId(),
                c.getWriter().getUserId(),
                c.getWriter().getName(),
                c.getContent(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
