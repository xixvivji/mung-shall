package com.example.backend.domain.adoption;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus; // UPDATED IMPORT
import com.example.backend.domain.adoption.AdoptionStepInstance; // UPDATED IMPORT
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "adoption", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "abandoned_dog_id"})
})
@Getter
@Setter
@NoArgsConstructor
public class Adoption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abandoned_dog_id", nullable = false)
    private AbandonedDog abandonedDog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelter_id")
    private User shelter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionProcessStatus processStatus;

    @OneToMany(mappedBy = "adoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdoptionStepInstance> steps = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to add steps
    public void addStep(AdoptionStepInstance stepInstance) {
        steps.add(stepInstance);
        stepInstance.setAdoption(this);
    }
}