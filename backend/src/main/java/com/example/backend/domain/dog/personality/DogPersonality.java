package com.example.backend.domain.dog.personality;

import com.example.backend.domain.dog.AbandonedDog;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
     * ✅ 운영 DB: NOT NULL 이므로 null 저장 금지
     * - 결측이면 3으로 채우고, 어떤 값이 보정됐는지는 missingTraits(@Transient)에 기록
     */
    @Column(nullable = false)
    private Integer activity;             // 활동성. 1~5

    @Column(nullable = false)
    private Integer barking;              // 짖음 정도. 1~5

    @Column(name = "separation_anxiety", nullable = false)
    private Integer separationAnxiety;    // 분리 불안 가능성. 1~5

    @Column(name = "shedding_level", nullable = false)
    private Integer sheddingLevel;        // 털 빠짐 정도. 1~5

    @Column(name = "stranger_friendliness", nullable = false)
    private Integer strangerFriendliness; // 친화력/경계심. 1~5

    /**
     * ✅ 운영 DB의 ai_observation 컬럼을 "증강 텍스트 저장소"로 사용
     * - 코드에서는 augmentedText로 다루되, 실제 컬럼은 ai_observation
     */
    @Column(name = "ai_observation", columnDefinition = "TEXT")
    private String augmentedText;

    /**
     * ✅ 스키마 변경 없이 "결측/보정된 trait" 추적용
     * - DB에 저장되지 않음
     * - 예: "barking,separationAnxiety"
     */
    @Transient
    @Builder.Default
    private List<String> missingTraits = new ArrayList<>();

    /**
     * 저장 직전에 null 방지 + 보정 기록
     * - 운영 DB NOT NULL 보호
     */
    @PrePersist
    @PreUpdate
    private void sanitizeAndBackfillNotNullTraits() {
        // Builder/Setter로 missingTraits null 들어오는 케이스 방지
        if (missingTraits == null) missingTraits = new ArrayList<>();

        activity = ensureNotNull(activity, "activity");
        barking = ensureNotNull(barking, "barking");
        separationAnxiety = ensureNotNull(separationAnxiety, "separationAnxiety");
        sheddingLevel = ensureNotNull(sheddingLevel, "sheddingLevel");
        strangerFriendliness = ensureNotNull(strangerFriendliness, "strangerFriendliness");
    }

    private Integer ensureNotNull(Integer value, String traitName) {
        if (value == null) {
            missingTraits.add(traitName);
            return 3; // 중간값 기본
        }
        return clampToRange(value, 1, 5);
    }

    private Integer clampToRange(Integer v, int min, int max) {
        if (v == null) return null;
        if (v < min) return min;
        if (v > max) return max;
        return v;
    }

    /**
     * 편의 메서드: missingTraits를 "barking,separationAnxiety" 형태로 보고 싶을 때
     * - DB 저장은 안 함
     */
    @Transient
    public String getMissingTraitsCsv() {
        if (missingTraits == null || missingTraits.isEmpty()) return "";
        return missingTraits.stream().distinct().collect(Collectors.joining(","));
    }
}
