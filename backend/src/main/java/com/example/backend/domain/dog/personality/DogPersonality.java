package com.example.backend.domain.dog.personality;

import com.example.backend.domain.dog.AbandonedDog;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "dog_personality",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_dog_personality_abandoned_dog", columnNames = "abandoned_dog_id")
        }
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DogPersonality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1:1 유지
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

    /**
     * ✅ 기존 운영 필드(일단 유지)
     * - 지금 실제로 반환/사용 안 하더라도 update 모드에서 컬럼 제거는 위험하니 유지
     * - 나중에 ddl-auto=validate + 마이그레이션으로 제거
     */
    private Integer activity;             // 활동성. 1~5
    private Integer barking;              // 짖음 정도. 1~5
    private Integer separationAnxiety;    // 분리 불안 가능성. 1~5
    private Integer sheddingLevel;        // 털 빠짐 정도. 1~5
    private Integer strangerFriendliness; // 낯선 사람에 대한 친화력. 1~5

    /**
     * ✅ 새 핵심 필드: 증강 텍스트(정규화 문장)
     */
    @Column(columnDefinition = "TEXT")
    private String augmentedText;

    /**
     * ✅ 결측치 허용: 예) "barking" 또는 "barking,separationAnxiety"
     * - “특성 5개 중 1개까지 결측 가능” 같은 정책을 운영에서 검증/추적하려고 남김
     */
    @Column(length = 100)
    private String missingTraits;

    /**
     * ✅ 임베딩 저장(옵션)
     * - float[] -> byte[] 직렬화해서 저장하는 용도
     */
    @Lob
    @Column(name = "embedding_blob", columnDefinition = "LONGBLOB")
    private byte[] embedding;

    @Column(length = 100)
    private String embeddingModel;

    private Integer embeddingDim;

    /**
     * 생성/수정 시각 (있으면 좋음. 기존 테이블에 없으면 update로 컬럼 추가됨)
     */
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}