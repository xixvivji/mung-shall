package com.example.backend.service;

import com.example.backend.api.board.dto.*;
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

import java.util.*;
import java.util.stream.Collectors;

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

        Long parentId = request.parentCommentId();

        BoardComment saved;

        if (parentId == null) {
            saved = boardCommentRepository.save(BoardComment.create(board, writer, content));
        } else {
            BoardComment parent = boardCommentRepository.findByIdAndDeletedAtIsNull(parentId)
                    .orElseThrow(() -> ApiException.notFound("부모 댓글이 존재하지 않습니다."));

            if (!Objects.equals(parent.getBoard().getId(), boardId)) {
                throw ApiException.badRequest("부모 댓글이 해당 게시글에 속하지 않습니다.");
            }

            if (parent.isReply()) {
                throw ApiException.badRequest("대댓글에는 답글을 달 수 없습니다. (1 depth 제한)");
            }

            saved = boardCommentRepository.save(BoardComment.reply(board, writer, parent, content));
        }

        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<BoardCommentThreadResponse> getComments(Long boardId) {
        boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        List<BoardComment> all = boardCommentRepository.findByBoard_IdAndDeletedAtIsNullOrderByCreatedAtAsc(boardId);

        // parentId 기준으로 그룹핑
        Map<Long, List<BoardComment>> byParentId = all.stream()
                .filter(c -> c.getParentComment() != null)
                .collect(Collectors.groupingBy(c -> c.getParentComment().getId(), LinkedHashMap::new, Collectors.toList()));

        // 최상위(부모 없는 댓글)만 뽑아서 replies 붙여서 반환
        List<BoardCommentThreadResponse> result = new ArrayList<>();
        for (BoardComment c : all) {
            if (c.getParentComment() != null) continue; // 최상위만
            List<BoardComment> replies = byParentId.getOrDefault(c.getId(), List.of());
            result.add(new BoardCommentThreadResponse(
                    BoardCommentResponse.from(c),
                    replies.stream().map(BoardCommentResponse::from).toList()
            ));
        }
        return result;
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

        if (!comment.isReply()) {
            List<BoardComment> replies = boardCommentRepository.findByParentComment_IdAndDeletedAtIsNullOrderByCreatedAtAsc(comment.getId());
            for (BoardComment r : replies) {
                r.softDelete();
            }
        }

        comment.softDelete();
    }
}
