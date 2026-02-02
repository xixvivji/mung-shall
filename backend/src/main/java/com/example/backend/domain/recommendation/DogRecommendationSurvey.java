package com.example.backend.domain.recommendation;

import com.example.backend.domain.survey.enums.FurTolerance;
import com.example.backend.domain.survey.enums.HouseEmptyTime;
import com.example.backend.domain.survey.enums.ResidenceType;
import com.example.backend.domain.survey.enums.RestActivityLevel;
import com.example.backend.domain.survey.enums.VisitorFrequency;
import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "dog_recommendation_survey")
@Getter
@Setter
@NoArgsConstructor
public class DogRecommendationSurvey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true) // A user has one survey
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RestActivityLevel restActivityLevel; // 쉴때 무엇을 하는가 (활동성)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResidenceType residenceType; // 살고 있는 집의 형태

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HouseEmptyTime houseEmptyTime; // 평소에 얼마나 집을 비우시나요?

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FurTolerance furTolerance; // 털빠짐 감수 정도

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VisitorFrequency visitorFrequency; // 가족 구성원 외 타인의 방문 빈도

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public DogRecommendationSurvey(User user, RestActivityLevel restActivityLevel, ResidenceType residenceType, HouseEmptyTime houseEmptyTime, FurTolerance furTolerance, VisitorFrequency visitorFrequency) {
        this.user = user;
        this.restActivityLevel = restActivityLevel;
        this.residenceType = residenceType;
        this.houseEmptyTime = houseEmptyTime;
        this.furTolerance = furTolerance;
        this.visitorFrequency = visitorFrequency;
    }

    public void update(RestActivityLevel restActivityLevel, ResidenceType residenceType, HouseEmptyTime houseEmptyTime, FurTolerance furTolerance, VisitorFrequency visitorFrequency) {
        this.restActivityLevel = restActivityLevel;
        this.residenceType = residenceType;
        this.houseEmptyTime = houseEmptyTime;
        this.furTolerance = furTolerance;
        this.visitorFrequency = visitorFrequency;
    }
}
