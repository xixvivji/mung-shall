package com.example.backend.repository;

import com.example.backend.domain.board.BoardCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BoardCommentLikeRepository extends JpaRepository<BoardCommentLike, Long> {

    Optional<BoardCommentLike> findByComment_IdAndUser_UserId(Long commentId, Long userId);

    boolean existsByComment_IdAndUser_UserId(Long commentId, Long userId);

    List<BoardCommentLike> findByUser_UserIdAndComment_IdIn(Long userId, Collection<Long> commentIds);

    @Query("""
        select l.comment.id as commentId, count(l.id) as cnt
        from BoardCommentLike l
        where l.comment.id in :commentIds
        group by l.comment.id
    """)
    List<Object[]> countLikesByCommentIds(Collection<Long> commentIds);
}
