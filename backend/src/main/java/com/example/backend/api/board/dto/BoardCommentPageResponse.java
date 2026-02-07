package com.example.backend.api.board.dto;

import java.util.List;

public record BoardCommentPageResponse(
        List<BoardCommentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
    public static BoardCommentPageResponse of(
            List<BoardCommentResponse> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean last
    ) {
        return new BoardCommentPageResponse(content, page, size, totalElements, totalPages, last);
    }
}
