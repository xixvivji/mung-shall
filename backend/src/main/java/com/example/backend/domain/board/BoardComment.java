package com.example.backend.domain.board;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Getter
@NoArgsConstructor(access = PROTECTED)
@Table(name = "board_comments", indexes = {
        @Index(name = "idx_board_comments_board_id", columnList = "board_id"),
        @Index(name = "idx_board_comments_user_id", columnList = "user_id"),
        @Index(name = "idx_board_comments_parent_id", columnList = "parent_comment_id")
})
public class BoardComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User writer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private BoardComment parentComment;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static BoardComment create(Board board, User writer, String content) {
        BoardComment c = new BoardComment();
        c.board = board;
        c.writer = writer;
        c.content = content;
        return c;
    }

    public static BoardComment reply(Board board, User writer, BoardComment parent, String content) {
        BoardComment c = new BoardComment();
        c.board = board;
        c.writer = writer;
        c.parentComment = parent;
        c.content = content;
        return c;
    }

    public boolean isReply() {
        return this.parentComment != null;
    }

    public void updateContent(String content) {
        this.content = content;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }
}
