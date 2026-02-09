package com.example.backend.api.board.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record BoardListResponse(
        List<BoardListItemDto> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean hasNext
) {
    public static BoardListResponse from(Page<BoardListItemDto> pageResult) {
        return new BoardListResponse(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.hasNext()
        );
    }
}
