package com.example.backend.service;

import com.example.backend.common.ApiException;
import com.example.backend.domain.board.BoardComment;
import com.example.backend.domain.board.BoardCommentLike;
import com.example.backend.domain.user.User;
import com.example.backend.repository.BoardCommentLikeRepository;
import com.example.backend.repository.BoardCommentRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BoardCommentLikeService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;
    private final UserRepository userRepository;

    @Transactional
    public LikeToggleResult toggle(Long userId, Long commentId) {

        BoardComment comment = boardCommentRepository.findByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 댓글입니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));

        boolean liked = boardCommentLikeRepository.findByComment_IdAndUser_UserId(commentId, userId)
                .map(existing -> {
                    boardCommentLikeRepository.delete(existing);
                    return false; // 좋아요 취소
                })
                .orElseGet(() -> {
                    boardCommentLikeRepository.save(BoardCommentLike.create(comment, user));
                    return true; // 좋아요 등록
                });

        long likeCount = boardCommentLikeRepository.countByComment_Id(commentId);

        return new LikeToggleResult(liked, likeCount);
    }

    public record LikeToggleResult(boolean liked, long likeCount) {}
}
