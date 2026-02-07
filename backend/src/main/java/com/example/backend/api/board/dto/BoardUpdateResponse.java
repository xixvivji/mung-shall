package com.example.backend.api.board.dto;

public record BoardUpdateResponse(Long id) {
    public static BoardUpdateResponse of(Long id) {
        return new BoardUpdateResponse(id);
    }
}
