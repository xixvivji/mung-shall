package com.example.backend.api.board.dto;

import java.util.List;

public record BoardCommentThreadResponse(
        BoardCommentResponse comment,
        List<BoardCommentResponse> replies
) {
}
