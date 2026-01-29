package com.example.backend.service;

import com.example.backend.api.board.dto.BoardCommentCreateRequest;
import com.example.backend.api.board.dto.BoardCommentResponse;
import com.example.backend.api.board.dto.BoardCommentUpdateRequest;
import com.example.backend.common.ApiException;
import com.example.backend.domain.board.Board;
import com.example.backend.domain.board.BoardComment;
import com.example.backend.domain.user.User;
import com.example.backend.repository.BoardCommentRepository;
import com.example.backend.repository.BoardRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardRepository boardRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long createComment(Long userId, Long boardId, BoardCommentCreateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");
        String content = (request.content() == null) ? null : request.content().trim();
        if (content == null || content.isBlank()) throw ApiException.badRequest("댓글 내용은 필수입니다.");

        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        User writer = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));

        BoardComment saved = boardCommentRepository.save(BoardComment.create(board, writer, content));
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<BoardCommentResponse> getComments(Long boardId) {
        boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        return boardCommentRepository.findByBoard_IdAndDeletedAtIsNullOrderByCreatedAtAsc(boardId)
                .stream()
                .map(BoardCommentResponse::from)
                .toList();
    }

    @Transactional
    public Long updateComment(Long userId, Long commentId, BoardCommentUpdateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");
        String content = (request.content() == null) ? null : request.content().trim();
        if (content == null || content.isBlank()) throw ApiException.badRequest("댓글 내용은 필수입니다.");

        BoardComment comment = boardCommentRepository.findByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 댓글입니다."));

        if (!comment.getWriter().getUserId().equals(userId)) {
            throw ApiException.forbidden("작성자만 수정할 수 있습니다.");
        }

        comment.updateContent(content);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        BoardComment comment = boardCommentRepository.findByIdAndDeletedAtIsNull(commentId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 댓글입니다."));

        if (!comment.getWriter().getUserId().equals(userId)) {
            throw ApiException.forbidden("작성자만 삭제할 수 있습니다.");
        }

        comment.softDelete();
    }
}
