package com.example.backend.api.board.dto;

public record BoardCreateResponse(
        Long id
) {
    public static BoardCreateResponse of(Long id) {
        return new BoardCreateResponse(id);
    }
}
