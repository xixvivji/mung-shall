package com.example.backend.domain.dog.personality;

import com.example.backend.domain.dog.AbandonedDog;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dog_personality")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DogPersonality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

    private int activity;             // 활동성
    private int barking;              // 짖음
    private int separationAnxiety;    // 분리 불안
    private int sheddingLevel;       // 털 빠짐 정도
    private int strangerFriendliness; // 낯선 사람에 대한 친화력(경계심)

    @Column(columnDefinition = "TEXT")
    private String aiObservation;

}
