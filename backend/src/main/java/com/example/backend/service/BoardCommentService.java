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
import com.example.backend.repository.BoardCommentLikeRepository;
import com.example.backend.domain.board.BoardCommentLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.example.backend.api.board.dto.BoardCommentPageResponse;
import org.springframework.data.domain.*;

import java.util.*;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardRepository boardRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final UserRepository userRepository;
    private final BoardCommentLikeRepository boardCommentLikeRepository;

    @Transactional
    public Long createComment(Long userId, Long boardId, BoardCommentCreateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");

        String content = (request.content() == null) ? null : request.content().trim();
        if (content == null || content.isBlank()) throw ApiException.badRequest("내용은 필수입니다.");

        Board board = boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        User writer = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("로그인이 필요합니다."));

        BoardComment parent = null;
        if (request.parentCommentId() != null) {
            parent = boardCommentRepository.findByIdAndDeletedAtIsNull(request.parentCommentId())
                    .orElseThrow(() -> ApiException.notFound("부모 댓글이 존재하지 않습니다."));

            if (!parent.getBoard().getId().equals(boardId)) {
                throw ApiException.badRequest("부모 댓글이 해당 게시글의 댓글이 아닙니다.");
            }

            if (parent.getParentComment() != null) {
                throw ApiException.badRequest("대댓글에는 답글을 달 수 없습니다.(depth 제한)");
            }
        }

        BoardComment saved = boardCommentRepository.save(BoardComment.create(board, writer, content, parent));
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<BoardCommentResponse> getComments(Long userIdOrNull, Long boardId) {

        boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        List<BoardComment> all =
                boardCommentRepository.findByBoard_IdAndDeletedAtIsNullOrderByCreatedAtAsc(boardId);

        if (all.isEmpty()) return List.of();

        List<Long> commentIds = all.stream().map(BoardComment::getId).toList();

        Map<Long, Long> likeCountMap = new HashMap<>();
        List<Object[]> counts =
                boardCommentLikeRepository.countLikesByCommentIds(commentIds);

        for (Object[] row : counts) {
            Long commentId = (Long) row[0];
            Long cnt = (Long) row[1];
            likeCountMap.put(commentId, cnt);
        }

        Set<Long> likedCommentIds = new HashSet<>();
        if (userIdOrNull != null) {
            List<BoardCommentLike> likes =
                    boardCommentLikeRepository.findByUser_UserIdAndComment_IdIn(userIdOrNull, commentIds);
            for (BoardCommentLike l : likes) {
                likedCommentIds.add(l.getComment().getId());
            }
        }

        Map<Long, BoardCommentResponse> nodeMap = new LinkedHashMap<>();
        for (BoardComment c : all) {
            long likeCount = likeCountMap.getOrDefault(c.getId(), 0L);
            boolean likedByMe = likedCommentIds.contains(c.getId());

            nodeMap.put(
                    c.getId(),
                    BoardCommentResponse.of(c, likeCount, likedByMe)
            );
        }

        List<BoardCommentResponse> roots = new ArrayList<>();

        for (BoardComment c : all) {
            BoardCommentResponse node = nodeMap.get(c.getId());
            Long parentId =
                    (c.getParentComment() == null) ? null : c.getParentComment().getId();

            if (parentId == null) {
                roots.add(node);
            } else {
                BoardCommentResponse parent = nodeMap.get(parentId);
                if (parent != null) {
                    parent.replies().add(node);
                }
            }
        }

        return roots;
    }



    @Transactional
    public Long updateComment(Long userId, Long commentId, BoardCommentUpdateRequest request) {
        if (request == null) throw ApiException.badRequest("요청이 비어있습니다.");

        String content = (request.content() == null) ? null : request.content().trim();
        if (content == null || content.isBlank()) throw ApiException.badRequest("내용은 필수입니다.");

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

    @Transactional(readOnly = true)
    public BoardCommentPageResponse getCommentsPaged(Long userIdOrNull, Long boardId, int page, int size) {

        boardRepository.findByIdAndDeletedAtIsNull(boardId)
                .orElseThrow(() -> ApiException.notFound("삭제되었거나 존재하지 않는 게시글입니다."));

        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 20 : Math.min(size, 50);

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.ASC, "createdAt")
        );

        Page<BoardComment> rootPage =
                boardCommentRepository.findByBoard_IdAndParentCommentIsNullAndDeletedAtIsNullOrderByCreatedAtAsc(
                        boardId, pageable
                );

        List<BoardComment> roots = rootPage.getContent();

        if (roots.isEmpty()) {
            return BoardCommentPageResponse.of(
                    List.of(),
                    safePage,
                    safeSize,
                    rootPage.getTotalElements(),
                    rootPage.getTotalPages(),
                    rootPage.isLast()
            );
        }

        List<Long> rootIds = roots.stream().map(BoardComment::getId).toList();

        List<BoardComment> replies =
                boardCommentRepository.findByBoard_IdAndParentComment_IdInAndDeletedAtIsNullOrderByCreatedAtAsc(
                        boardId, rootIds
                );

        List<BoardComment> all = new ArrayList<>(roots.size() + replies.size());
        all.addAll(roots);
        all.addAll(replies);

        List<Long> commentIds = all.stream().map(BoardComment::getId).toList();

        Map<Long, Long> likeCountMap = new HashMap<>();
        if (!commentIds.isEmpty()) {
            List<Object[]> counts = boardCommentLikeRepository.countLikesByCommentIds(commentIds);
            for (Object[] row : counts) {
                likeCountMap.put((Long) row[0], (Long) row[1]);
            }
        }

        Set<Long> likedCommentIds = new HashSet<>();
        if (userIdOrNull != null && !commentIds.isEmpty()) {
            List<BoardCommentLike> likes =
                    boardCommentLikeRepository.findByUser_UserIdAndComment_IdIn(userIdOrNull, commentIds);
            for (BoardCommentLike l : likes) {
                likedCommentIds.add(l.getComment().getId());
            }
        }

        Map<Long, BoardCommentResponse> nodeMap = new LinkedHashMap<>();
        for (BoardComment c : all) {
            long likeCount = likeCountMap.getOrDefault(c.getId(), 0L);
            boolean likedByMe = likedCommentIds.contains(c.getId());
            nodeMap.put(c.getId(), BoardCommentResponse.of(c, likeCount, likedByMe));
        }

        List<BoardCommentResponse> rootResponses = new ArrayList<>();

        for (BoardComment c : all) {
            BoardCommentResponse node = nodeMap.get(c.getId());
            Long parentId = (c.getParentComment() == null) ? null : c.getParentComment().getId();

            if (parentId == null) {
                rootResponses.add(node);
            } else {
                BoardCommentResponse parent = nodeMap.get(parentId);
                if (parent != null) parent.replies().add(node);
            }
        }

        return BoardCommentPageResponse.of(
                rootResponses,
                safePage,
                safeSize,
                rootPage.getTotalElements(),
                rootPage.getTotalPages(),
                rootPage.isLast()
        );
    }


}
