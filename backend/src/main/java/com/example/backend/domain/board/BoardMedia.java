package com.example.backend.domain.board;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Getter
@NoArgsConstructor(access = PROTECTED)
@Table(name = "board_media")
public class BoardMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_media_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "board_id")
    private Board board;

    @Column(nullable = false, length = 1000)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BoardMediaType type = BoardMediaType.IMAGE;

    @Column(nullable = false)
    private int sortOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public static BoardMedia of(Board board, String url, int order) {
        BoardMedia m = new BoardMedia();
        m.board = board;
        m.url = url;
        m.sortOrder = order;
        m.type = BoardMediaType.IMAGE;
        return m;
    }
}
