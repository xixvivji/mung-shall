package com.example.backend.domain.postcaresession;

import com.example.backend.domain.adoption.Adoption;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "post_care_session")
public class PostCareSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 어떤 입양 건인지 (Adoption 테이블과 연결)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_id")
    private Adoption adoption;

    private LocalDateTime scheduledAt; // 예약 시간
    private int round;                 // 1차, 2차...

    // 상태 (WAITING: 대기중, ONGOING: 상담중, COMPLETED: 완료)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'WAITING'")
    private String status;

    private String sessionId;          // OpenVidu 방 ID
    private String recordingUrl;       // 녹화 영상 URL
}