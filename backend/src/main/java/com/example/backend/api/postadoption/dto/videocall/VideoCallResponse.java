package com.example.backend.api.postadoption.dto.videocall;

import com.example.backend.domain.postadoption.videocall.PostAdoptionVideoCall;
import com.example.backend.domain.postadoption.videocall.VideoCallStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VideoCallResponse {
    private Long videoCallId;
    private Integer month;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime scheduledDateTime;
    private LocalDateTime completedAt; // Add this field
    private String openViduSessionId; // Add this field
    private VideoCallStatus status;

    public static VideoCallResponse fromEntity(PostAdoptionVideoCall videoCall) {
        VideoCallResponse response = new VideoCallResponse();
        response.setVideoCallId(videoCall.getId());
        response.setMonth(videoCall.getMonth());
        response.setScheduledDateTime(videoCall.getScheduledDateTime());
        response.setCompletedAt(videoCall.getCompletedAt()); // Set completedAt
        response.setOpenViduSessionId(videoCall.getOpenViduSessionId()); // Set openViduSessionId
        response.setStatus(videoCall.getStatus());
        return response;
    }
}
