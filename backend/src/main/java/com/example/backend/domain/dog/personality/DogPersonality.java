package com.example.backend.domain.dog.personality;

import com.example.backend.domain.dog.AbandonedDog;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dog_personality")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DogPersonality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

    private int activity;             // 활동성
    private int barking;              // 짖음
    private int separationAnxiety;    // 분리 불안
    private int shedding_level;       // 털 빠짐 정도
    private int strangerFriendliness; // 낯선 사람에 대한 친화도(경계심)

    @Column(length = 1000)
    private String aiComment;

}
