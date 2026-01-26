package com.example.backend.service;

import com.example.backend.api.board.dto.BoardListItemDto;
import com.example.backend.domain.board.Board;
import com.example.backend.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public Page<BoardListItemDto> getBoardList(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 20 : Math.min(size, 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return boardRepository.findByDeletedAtIsNull(pageable)
                .map(this::toListItemDto);
    }

    private BoardListItemDto toListItemDto(Board board) {
        return new BoardListItemDto(
                board.getId(),
                board.getTitle(),
                board.getWriter().getName(),
                null,
                board.getCreatedAt(),
                board.getViewCount()
        );
    }
}
