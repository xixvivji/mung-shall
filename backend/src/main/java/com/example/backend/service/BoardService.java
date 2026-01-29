package com.example.backend.service;

import com.example.backend.api.board.dto.BoardCreateRequest;
import com.example.backend.api.board.dto.BoardDetailResponse;
import com.example.backend.api.board.dto.BoardListItemDto;
import com.example.backend.api.board.dto.BoardUpdateRequest;
import com.example.backend.common.ApiException;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.board.Board;
import com.example.backend.domain.board.BoardCategory;
import com.example.backend.domain.user.User;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.adoption.AdoptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final AdoptionRepository adoptionRepository;

    @Transactional(readOnly = true)
    public Page<BoardListItemDto> getBoardList(int page, int size, String keyword, String category, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 20 : Math.min(size, 50);

        String sortKey = (sort == null || sort.isBlank()) ? "createdAt" : sort.trim();

        Sort s;
        switch (sortKey) {
            case "createdAt" -> s = Sort.by(Sort.Direction.DESC, "createdAt");
            case "viewCount" -> s = Sort.by(Sort.Direction.DESC, "viewCount");
            default -> throw ApiException.badRequest("잘못된 파라미터");
        }

        Pageable pageable = PageRequest.of(safePage, safeSize, s);

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

    @Transactional
    public Long createBoard(Long userId, BoardCreateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");

        String title = (request.title() == null) ? null : request.title().trim();
        String content = (request.content() == null) ? null : request.content().trim();
        String categoryRaw = (request.category() == null) ? null : request.category().trim();

        if (title == null || title.isBlank()) throw ApiException.badRequest("제목은 필수입니다.");
        if (content == null || content.isBlank()) throw ApiException.badRequest("내용은 필수입니다.");
        if (categoryRaw == null || categoryRaw.isBlank()) throw ApiException.badRequest("카테고리는 필수입니다.");

        BoardCategory category;
        try {
            category = BoardCategory.valueOf(categoryRaw.toUpperCase());
        } catch (Exception e) {
            throw ApiException.badRequest("카테고리가 올바르지 않습니다.");
        }

        User writer = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));

        validateReviewPermission(userId, category);

        Board board = Board.create(writer, title, content, category);

        board.replaceMedias(request.mediaUrls());

        Board saved = boardRepository.save(board);
        return saved.getId();
    }

    private void validateReviewPermission(Long userId, BoardCategory category) {
        if (category != BoardCategory.REVIEW) return;

        boolean hasCompletedAdoption =
                adoptionRepository.existsByUser_UserIdAndProcessStatus(
                        userId,
                        AdoptionProcessStatus.COMPLETED
                );

        if (!hasCompletedAdoption) {
            throw ApiException.forbidden("입양 완료자만 후기 작성이 가능합니다.");
        }
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

    @Transactional
    public BoardDetailResponse getBoardDetail(Long boardId) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        board.increaseViewCount();
        return BoardDetailResponse.from(board);
    }

    @Transactional
    public Long updateBoard(Long userId, Long boardId, BoardUpdateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");

        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        if (!board.getWriter().getUserId().equals(userId)) {
            throw ApiException.forbidden("작성자만 수정할 수 있습니다.");
        }

        String title = (request.title() == null) ? null : request.title().trim();
        String content = (request.content() == null) ? null : request.content().trim();
        String categoryRaw = (request.category() == null) ? null : request.category().trim();

        if (title == null || title.isBlank()) throw ApiException.badRequest("제목은 필수입니다.");
        if (content == null || content.isBlank()) throw ApiException.badRequest("내용은 필수입니다.");
        if (categoryRaw == null || categoryRaw.isBlank()) throw ApiException.badRequest("카테고리는 필수입니다.");

        BoardCategory category;
        try {
            category = BoardCategory.valueOf(categoryRaw.toUpperCase());
        } catch (Exception e) {
            throw ApiException.badRequest("카테고리가 올바르지 않습니다.");
        }

        validateReviewPermission(userId, category);

        board.update(title, content, category);

        board.replaceMedias(request.mediaUrls());

        return board.getId();
    }

    @Transactional
    public void deleteBoard(Long userId, Long boardId) {
        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        if (!board.getWriter().getUserId().equals(userId)) {
            throw ApiException.forbidden("작성자만 삭제할 수 있습니다.");
        }

        board.softDelete();
    }
}
