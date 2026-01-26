package com.example.backend.api.board.dto;

import java.time.LocalDateTime;

public record BoardListItemDto(
        Long id,
        String title,
        String writer,
        String thumbnailUrl,
        LocalDateTime createdAt,
        int viewCount
) {
}
