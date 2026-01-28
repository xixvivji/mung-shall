package com.example.backend.api.board.dto;

public record BoardUpdateRequest(
        String title,
        String content,
        String category
) {
}
