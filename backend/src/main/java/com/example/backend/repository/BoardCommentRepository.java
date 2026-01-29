package com.example.backend.repository;

import com.example.backend.domain.board.BoardComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {

    List<BoardComment> findByBoard_IdAndDeletedAtIsNullOrderByCreatedAtAsc(Long boardId);

    Optional<BoardComment> findByIdAndDeletedAtIsNull(Long commentId);

    long countByBoard_IdAndDeletedAtIsNull(Long boardId);

    List<BoardComment> findByParentComment_IdAndDeletedAtIsNullOrderByCreatedAtAsc(Long parentId);
}
