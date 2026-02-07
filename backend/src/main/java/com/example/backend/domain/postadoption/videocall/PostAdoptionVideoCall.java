package com.example.backend.domain.postadoption.videocall;

import com.example.backend.domain.postadoption.PostAdoption;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "post_adoption_video_calls")
public class PostAdoptionVideoCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_adoption_id", nullable = false)
    private PostAdoption postAdoption;

    @Column(nullable = false)
    private Integer month;

    private LocalDateTime scheduledDateTime;
    private LocalDateTime completedAt;
    private String openViduSessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VideoCallStatus status;

    public static PostAdoptionVideoCall create(PostAdoption postAdoption, int month) {
        PostAdoptionVideoCall videoCall = new PostAdoptionVideoCall();
        videoCall.postAdoption = postAdoption;
        videoCall.month = month;
        videoCall.status = VideoCallStatus.NOT_SCHEDULED;
        return videoCall;
    }

    public void schedule(LocalDateTime scheduledDateTime) { // Removed openViduSessionId parameter
        this.scheduledDateTime = scheduledDateTime;
        this.status = VideoCallStatus.SCHEDULED;
    }

    public void cancel() {
        this.scheduledDateTime = null;
        this.openViduSessionId = null; // Clear session ID on cancel
        this.status = VideoCallStatus.CANCELLED;
    }
    
    public void complete(LocalDateTime completedAt) {
        this.completedAt = completedAt;
        this.openViduSessionId = null; // Clear session ID on completion
        this.status = VideoCallStatus.COMPLETED;
    }

    public void setOpenViduSessionId(String openViduSessionId) { // New method to set session ID
        this.openViduSessionId = openViduSessionId;
    }
}
