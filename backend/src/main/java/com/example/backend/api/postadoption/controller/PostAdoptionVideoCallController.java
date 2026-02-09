package com.example.backend.api.postadoption.controller;

import com.example.backend.api.postadoption.dto.videocall.VideoCallCompleteRequest;
import com.example.backend.api.postadoption.dto.videocall.VideoCallOpenRoomRequest;
import com.example.backend.api.postadoption.dto.videocall.VideoCallScheduleRequest;
import com.example.backend.api.postadoption.dto.videocall.VideoCallResponse;
import com.example.backend.domain.postadoption.videocall.PostAdoptionVideoCall;
import com.example.backend.service.postadoption.PostAdoptionVideoCallService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/post-adoptions/{postAdoptionId}/video-calls")
@RequiredArgsConstructor
@Tag(name = "입양 후 화상 통화 API", description = "입양 후 관리 프로세스의 화상 통화 예약 및 조회 관련 API")
public class PostAdoptionVideoCallController {

    private final PostAdoptionVideoCallService videoCallService;

    @Operation(summary = "입양 후 화상 통화 목록 조회", description = "특정 입양 후 관리 프로세스에 대한 모든 화상 통화 예약 정보를 조회합니다. 보호소 또는 해당 입양의 사용자만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "입양 후 관리 프로세스를 찾을 수 없음")
    })
    @GetMapping
    @PreAuthorize("hasRole('SHELTER') or @postAdoptionSecurity.isOwner(authentication, #postAdoptionId)")
    public ResponseEntity<List<VideoCallResponse>> getVideoCalls(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId) {
        List<PostAdoptionVideoCall> videoCalls = videoCallService.getVideoCallsForPostAdoption(postAdoptionId);
        List<VideoCallResponse> responses = videoCalls.stream()
                .map(VideoCallResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "입양 후 특정 개월차 화상 통화 조회", description = "특정 입양 후 관리 프로세스의 특정 개월차 화상 통화 예약 정보를 조회합니다. 보호소 또는 해당 입양의 사용자만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 유효하지 않은 개월차)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
            @ApiResponse(responseCode = "404", description = "화상 통화 기록을 찾을 수 없음")
    })
    @GetMapping("/{month}")
    @PreAuthorize("hasRole('SHELTER') or @postAdoptionSecurity.isOwner(authentication, #postAdoptionId)")
    public ResponseEntity<VideoCallResponse> getVideoCallByMonth(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "개월차 (1, 2, 3)", required = true)
            @PathVariable int month) {
        PostAdoptionVideoCall videoCall = videoCallService.getVideoCallByPostAdoptionIdAndMonth(postAdoptionId, month);
        return ResponseEntity.ok(VideoCallResponse.fromEntity(videoCall));
    }

    @Operation(summary = "입양 후 화상 통화 예약/수정", description = "특정 입양 후 관리 프로세스의 특정 개월차 화상 통화를 예약하거나 수정합니다. 보호소만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "예약/수정 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 유효하지 않은 개월차)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "보호소 권한 없음"),
            @ApiResponse(responseCode = "404", description = "화상 통화 기록을 찾을 수 없음")
    })
    @PutMapping("/{month}")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<VideoCallResponse> scheduleVideoCall(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "개월차 (1, 2, 3)", required = true)
            @PathVariable int month,
            @RequestBody VideoCallScheduleRequest request) {
        PostAdoptionVideoCall videoCall = videoCallService.scheduleVideoCall(postAdoptionId, month, request);
        return ResponseEntity.ok(VideoCallResponse.fromEntity(videoCall));
    }

    @Operation(summary = "입양 후 화상 통화 완료 처리", description = "특정 입양 후 관리 프로세스의 특정 개월차 화상 통화를 완료 처리합니다. 보호소만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "완료 처리 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 유효하지 않은 개월차)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "보호소 권한 없음"),
            @ApiResponse(responseCode = "404", description = "화상 통화 기록을 찾을 수 없음")
    })
    @PatchMapping("/{month}/complete")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<VideoCallResponse> completeVideoCall(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "개월차 (1, 2, 3)", required = true)
            @PathVariable int month,
            @RequestBody VideoCallCompleteRequest request) {
        PostAdoptionVideoCall videoCall = videoCallService.completeVideoCall(postAdoptionId, month, request);
        return ResponseEntity.ok(VideoCallResponse.fromEntity(videoCall));
    }

    @Operation(summary = "입양 후 화상 통화 방 열기 (Session ID 등록)", description = "보호소가 OpenVidu 세션을 생성한 후, 해당 세션 ID를 등록하여 사용자가 참여할 수 있도록 합니다. 보호소만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Session ID 등록 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 유효하지 않은 개월차, Session ID 누락)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "보호소 권한 없음"),
            @ApiResponse(responseCode = "404", description = "화상 통화 기록을 찾을 수 없음")
    })
    @PatchMapping("/{month}/open-room")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<VideoCallResponse> openVideoCallRoom(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "개월차 (1, 2, 3)", required = true)
            @PathVariable int month,
            @RequestBody VideoCallOpenRoomRequest request) {
        PostAdoptionVideoCall videoCall = videoCallService.openVideoCallRoom(postAdoptionId, month, request);
        return ResponseEntity.ok(VideoCallResponse.fromEntity(videoCall));
    }

    @Operation(summary = "입양 후 화상 통화 예약 취소", description = "특정 입양 후 관리 프로세스의 특정 개월차 화상 통화 예약을 취소합니다. 보호소만 접근 가능합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "취소 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 (예: 유효하지 않은 개월차)"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "보호소 권한 없음"),
            @ApiResponse(responseCode = "404", description = "화상 통화 기록을 찾을 수 없음")
    })
    @DeleteMapping("/{month}")
    @PreAuthorize("hasRole('SHELTER')")
    public ResponseEntity<Void> cancelVideoCall(
            @Parameter(description = "입양 후 관리 프로세스 ID", required = true)
            @PathVariable Long postAdoptionId,
            @Parameter(description = "개월차 (1, 2, 3)", required = true)
            @PathVariable int month) {
        videoCallService.cancelVideoCall(postAdoptionId, month);
        return ResponseEntity.noContent().build();
    }

    
}
