package com.example.backend.domain.postadoption;

import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.postadoption.videocall.PostAdoptionVideoCall;
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

    @OneToMany(mappedBy = "postAdoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostAdoptionStepInstance> stepInstances = new ArrayList<>();

    @OneToMany(mappedBy = "postAdoption", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostAdoptionVideoCall> videoCalls = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public PostAdoption(Adoption adoption) {
        this.adoption = adoption;
    }

    // Helper method to add steps
    public void addStepInstance(PostAdoptionStepInstance stepInstance) {
        stepInstances.add(stepInstance);
        stepInstance.setPostAdoption(this);
    }

    public void initializeVideoCalls() {
        for (int i = 1; i <= 3; i++) {
            PostAdoptionVideoCall videoCall = PostAdoptionVideoCall.create(this, i);
            this.videoCalls.add(videoCall);
        }
    }
}
