package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.videocall.PostAdoptionVideoCall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostAdoptionVideoCallRepository extends JpaRepository<PostAdoptionVideoCall, Long> {
    List<PostAdoptionVideoCall> findByPostAdoptionId(Long postAdoptionId);
    Optional<PostAdoptionVideoCall> findByPostAdoptionIdAndMonth(Long postAdoptionId, int month);
    Optional<PostAdoptionVideoCall> findByOpenViduSessionId(String openViduSessionId);
}
