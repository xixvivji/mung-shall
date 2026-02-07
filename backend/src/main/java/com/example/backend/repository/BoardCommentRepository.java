package com.example.backend.repository;

import com.example.backend.domain.board.BoardComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {

    List<BoardComment> findByBoard_IdAndDeletedAtIsNullOrderByCreatedAtAsc(Long boardId);

    Optional<BoardComment> findByIdAndDeletedAtIsNull(Long commentId);

    long countByBoard_IdAndDeletedAtIsNull(Long boardId);

    Page<BoardComment> findByBoard_IdAndParentCommentIsNullAndDeletedAtIsNullOrderByCreatedAtAsc(
            Long boardId,
            Pageable pageable
    );

    List<BoardComment> findByBoard_IdAndParentComment_IdInAndDeletedAtIsNullOrderByCreatedAtAsc(
            Long boardId,
            Collection<Long> parentIds
    );
}
