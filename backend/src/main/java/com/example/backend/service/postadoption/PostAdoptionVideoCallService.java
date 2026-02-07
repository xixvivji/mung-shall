package com.example.backend.service.postadoption;

import com.example.backend.api.postadoption.dto.videocall.VideoCallCompleteRequest;
import com.example.backend.api.postadoption.dto.videocall.VideoCallOpenRoomRequest;
import com.example.backend.api.postadoption.dto.videocall.VideoCallScheduleRequest;
import com.example.backend.domain.postadoption.videocall.PostAdoptionVideoCall;
import com.example.backend.repository.postadoption.PostAdoptionRepository;
import com.example.backend.repository.postadoption.PostAdoptionVideoCallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostAdoptionVideoCallService {

    private final PostAdoptionVideoCallRepository videoCallRepository;
    private final PostAdoptionRepository postAdoptionRepository;

    @Transactional(readOnly = true)
    public List<PostAdoptionVideoCall> getVideoCallsForPostAdoption(Long postAdoptionId) {
        // Ensure postAdoption exists
        postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));
        return videoCallRepository.findByPostAdoptionId(postAdoptionId);
    }

    @Transactional(readOnly = true)
    public PostAdoptionVideoCall getVideoCallByPostAdoptionIdAndMonth(Long postAdoptionId, int month) {
        if (month < 1 || month > 3) {
            throw new IllegalArgumentException("Month must be between 1 and 3.");
        }
        // Ensure postAdoption exists
        postAdoptionRepository.findById(postAdoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Post-adoption process not found with ID: " + postAdoptionId));
        return videoCallRepository.findByPostAdoptionIdAndMonth(postAdoptionId, month)
                .orElseThrow(() -> new IllegalArgumentException("Video call record for month " + month + " not found."));
    }

    public PostAdoptionVideoCall scheduleVideoCall(Long postAdoptionId, int month, VideoCallScheduleRequest request) {
        if (month < 1 || month > 3) {
            throw new IllegalArgumentException("Month must be between 1 and 3.");
        }
        PostAdoptionVideoCall videoCall = videoCallRepository.findByPostAdoptionIdAndMonth(postAdoptionId, month)
                .orElseThrow(() -> new IllegalArgumentException("Video call record for month " + month + " not found."));

        videoCall.schedule(request.getScheduledDateTime());
        return videoCallRepository.save(videoCall);
    }

    public void cancelVideoCall(Long postAdoptionId, int month) {
        if (month < 1 || month > 3) {
            throw new IllegalArgumentException("Month must be between 1 and 3.");
        }
        PostAdoptionVideoCall videoCall = videoCallRepository.findByPostAdoptionIdAndMonth(postAdoptionId, month)
                .orElseThrow(() -> new IllegalArgumentException("Video call record for month " + month + " not found."));

        videoCall.cancel();
        videoCallRepository.save(videoCall); // Removed return statement
    }

    public PostAdoptionVideoCall completeVideoCall(Long postAdoptionId, int month, VideoCallCompleteRequest request) {
        if (month < 1 || month > 3) {
            throw new IllegalArgumentException("Month must be between 1 and 3.");
        }
        PostAdoptionVideoCall videoCall = videoCallRepository.findByPostAdoptionIdAndMonth(postAdoptionId, month)
                .orElseThrow(() -> new IllegalArgumentException("Video call record for month " + month + " not found."));

        videoCall.complete(request.getCompletedAt());
        return videoCallRepository.save(videoCall);
    }

    public PostAdoptionVideoCall openVideoCallRoom(Long postAdoptionId, int month, VideoCallOpenRoomRequest request) {
        if (month < 1 || month > 3) {
            throw new IllegalArgumentException("Month must be between 1 and 3.");
        }
        PostAdoptionVideoCall videoCall = videoCallRepository.findByPostAdoptionIdAndMonth(postAdoptionId, month)
                .orElseThrow(() -> new IllegalArgumentException("Video call record for month " + month + " not found."));

        videoCall.setOpenViduSessionId(request.getOpenViduSessionId());
        return videoCallRepository.save(videoCall);
    }
}
