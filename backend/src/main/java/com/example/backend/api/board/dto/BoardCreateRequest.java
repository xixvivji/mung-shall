package com.example.backend.api.board.dto;

import java.util.List;

public record BoardCreateRequest(
        String title,
        String content,
        String category,
        List<String> mediaUrls
) {
}
