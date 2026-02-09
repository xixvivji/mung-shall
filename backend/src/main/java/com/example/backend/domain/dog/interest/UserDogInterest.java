package com.example.backend.domain.dog.interest;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "user_dog_interest",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "abandoned_dog_id"})
        })
public class UserDogInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_dog_interest_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserDogInterest(User user, AbandonedDog abandonedDog) {
        this.user = user;
        this.abandonedDog = abandonedDog;
    }
}
