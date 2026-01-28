package com.example.backend.repository;

import com.example.backend.domain.board.Board;
import com.example.backend.domain.board.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Page<Board> findByDeletedAtIsNull(Pageable pageable);

    Page<Board> findByDeletedAtIsNullAndCategory(BoardCategory category, Pageable pageable);

    Page<Board> findByDeletedAtIsNullAndTitleContainingOrDeletedAtIsNullAndContentContaining(
            String titleKeyword,
            String contentKeyword,
            Pageable pageable
    );

    Page<Board> findByDeletedAtIsNullAndCategoryAndTitleContainingOrDeletedAtIsNullAndCategoryAndContentContaining(
            BoardCategory category1,
            String titleKeyword,
            BoardCategory category2,
            String contentKeyword,
            Pageable pageable
    );
    Optional<Board> findByIdAndDeletedAtIsNull(Long id);
    boolean existsByIdAndDeletedAtIsNull(Long id);

}
