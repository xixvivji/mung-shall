package com.example.backend.api.board.dto;

public record BoardCreateRequest(
        String title,
        String content,
        String category
) {
}
