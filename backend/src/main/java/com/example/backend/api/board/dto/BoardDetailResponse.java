package com.example.backend.api.board.dto;

import com.example.backend.domain.board.Board;
import com.example.backend.domain.board.BoardCategory;

import java.time.LocalDateTime;
import java.util.List;

public record BoardDetailResponse(
        Long id,
        String title,
        String content,
        BoardCategory category,

        Long writerId,
        String writer,

        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        int viewCount,
        List<String> mediaUrls,
        long commentCount
) {
    public static BoardDetailResponse from(Board board, long commentCount) {
        return new BoardDetailResponse(
                board.getId(),
                board.getTitle(),
                board.getContent(),
                board.getCategory(),

                board.getWriter().getUserId(),
                board.getWriter().getName(),

                board.getCreatedAt(),
                board.getUpdatedAt(),
                board.getViewCount(),
                board.getMediaUrls(),
                commentCount
        );
    }
}
