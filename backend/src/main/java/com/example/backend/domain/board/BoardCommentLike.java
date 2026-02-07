package com.example.backend.domain.board;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Getter
@NoArgsConstructor(access = PROTECTED)
@Table(
        name = "board_comment_likes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_comment_like_user",
                        columnNames = {"comment_id", "user_id"}
                )
        }
)
public class BoardCommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "comment_id")
    private BoardComment comment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    public static BoardCommentLike create(BoardComment comment, User user) {
        BoardCommentLike like = new BoardCommentLike();
        like.comment = comment;
        like.user = user;
        return like;
    }
}
