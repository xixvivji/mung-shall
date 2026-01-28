package com.example.backend.service;

import com.example.backend.api.board.dto.BoardListItemDto;
import com.example.backend.common.ApiException;
import com.example.backend.domain.board.Board;
import com.example.backend.domain.board.BoardCategory;
import com.example.backend.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;

    public Page<BoardListItemDto> getBoardList(int page, int size, String keyword, String category) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 20 : Math.min(size, 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();

        BoardCategory cat = null;
        if (category != null && !category.isBlank()) {
            try {
                cat = BoardCategory.valueOf(category.trim().toUpperCase());
            } catch (Exception e) {
                throw ApiException.badRequest("잘못된 파라미터");
            }
        }

        Page<Board> pageResult;

        if (cat == null && kw == null) {
            pageResult = boardRepository.findByDeletedAtIsNull(pageable);

        } else if (cat != null && kw == null) {
            pageResult = boardRepository.findByDeletedAtIsNullAndCategory(cat, pageable);

        } else if (cat == null) {
            pageResult = boardRepository.findByDeletedAtIsNullAndTitleContainingOrDeletedAtIsNullAndContentContaining(
                    kw, kw, pageable
            );

        } else {
            pageResult = boardRepository.findByDeletedAtIsNullAndCategoryAndTitleContainingOrDeletedAtIsNullAndCategoryAndContentContaining(
                    cat, kw, cat, kw, pageable
            );
        }

        return pageResult.map(this::toListItemDto);
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
