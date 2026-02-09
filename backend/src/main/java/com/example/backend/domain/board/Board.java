package com.example.backend.domain.board;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Getter
@NoArgsConstructor(access = PROTECTED)
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "board_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User writer;

    @Column(nullable = false, length = 100)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BoardCategory category;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardMedia> medias = new ArrayList<>();

    @PrePersist
    private void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    private void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public static Board create(User writer, String title, String content, BoardCategory category) {
        Board b = new Board();
        b.writer = writer;
        b.title = title;
        b.content = content;
        b.category = category;
        return b;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }

    public void update(String title, String content, BoardCategory category) {
        this.title = title;
        this.content = content;
        this.category = category;
    }

    public void replaceMedias(List<String> urls) {
        this.medias.clear();
        if (urls == null) return;

        int i = 0;
        for (String url : urls) {
            if (url == null || url.isBlank()) continue;
            this.medias.add(BoardMedia.of(this, url.trim(), i++));
        }
    }

    public List<String> getMediaUrls() {
        if (this.medias == null) return List.of();
        return this.medias.stream()
                .map(BoardMedia::getUrl)
                .collect(Collectors.toList());
    }
}
