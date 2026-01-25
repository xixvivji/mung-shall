package com.example.backend.domain.postadoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.postadoption.enums.PostAdoptionProcessStatus;
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
@Table(name = "post_adoption")
@Getter
@Setter
@NoArgsConstructor
public class PostAdoption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_id", nullable = false, unique = true)
    private Adoption adoption;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostAdoptionProcessStatus processStatus;

    @OneToMany(mappedBy = "postAdoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostAdoptionStepInstance> stepInstances = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public PostAdoption(Adoption adoption) {
        this.adoption = adoption;
        this.processStatus = PostAdoptionProcessStatus.IN_PROGRESS; // 초기 상태는 IN_PROGRESS
    }

    // Helper method to add steps
    public void addStepInstance(PostAdoptionStepInstance stepInstance) {
        stepInstances.add(stepInstance);
        stepInstance.setPostAdoption(this);
    }
}
