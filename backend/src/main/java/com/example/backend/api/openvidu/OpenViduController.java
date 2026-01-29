package com.example.backend.api.openvidu;

import com.example.backend.domain.postcaresession.PostCareSession;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.domain.user.UserType;
import com.example.backend.repository.postcaresession.PostCareSessionRepository;
import io.openvidu.java.client.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.net.ssl.*;
import java.util.Map;

@RestController
@RequestMapping("/api/openvidu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OpenViduController {

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    private OpenVidu openVidu;

    private final PostCareSessionRepository postCareSessionRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void init() {
        // ... (SSL 인증서 무시 코드는 기존과 동일하게 유지) ...
        System.setProperty("jdk.internal.httpclient.disableHostnameVerification", "true");
        try {
            TrustManager[] trustAllCerts = new TrustManager[]{
                    new X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                        public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                    }
            };
            SSLContext sc = SSLContext.getInstance("TLSv1.2");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            SSLContext.setDefault(sc);
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        } catch (Exception e) {
            System.err.println("SSL 설정 실패: " + e.getMessage());
        }

        this.openVidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    /**
     * 1. 사후관리 방 생성 (보호소 직원이 '상담 시작' 버튼 클릭 시)
     * Request Body: { "postCareId": 15 }
     */
    @PostMapping("/sessions")
    public ResponseEntity<String> initializeSession(@RequestBody Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {

        Long postCareId = Long.parseLong(params.get("postCareId").toString());

        // 1. DB에서 해당 사후관리 예약 내역 조회
        PostCareSession postCareSession = postCareSessionRepository.findById(postCareId)
                .orElseThrow(() -> new RuntimeException("예약된 사후관리 내역이 없습니다."));

        // 2. 방 이름 생성 (예: postcare_15_1) -> 고유한 이름
        String customSessionId = "postcare_" + postCareId + "_" + postCareSession.getRound();

        // 3. 세션 설정 (녹화 수동 모드)
        SessionProperties properties = new SessionProperties.Builder()
                .customSessionId(customSessionId)
                .recordingMode(RecordingMode.MANUAL)
                .build();

        try {
            // OpenVidu 서버에 방 생성 요청
            Session session = openVidu.createSession(properties);

            // 4. DB 업데이트 (방 열림 상태로 변경)
            postCareSession.setSessionId(session.getSessionId());
            postCareSession.setStatus("ONGOING");
            postCareSessionRepository.save(postCareSession);

            return new ResponseEntity<>(session.getSessionId(), HttpStatus.OK);

        } catch (OpenViduHttpException e) {
            // 409 Conflict: 이미 방이 생성되어 있으면, 기존 방 ID 리턴하고 종료
            if (e.getStatus() == 409) {
                return new ResponseEntity<>(customSessionId, HttpStatus.OK);
            }
            throw e;
        }
    }

    /**
     * 2. 입장권(Token) 발급 (입양자, 보호소 직원 둘 다 여기로 요청)
     */
    @PostMapping("/sessions/{sessionId}/connections")
    public ResponseEntity<String> createConnection(@PathVariable("sessionId") String sessionId,
                                                   @RequestBody Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {

        // 1. 활성화된 세션 찾기
        Session session = openVidu.getActiveSession(sessionId);
        if (session == null) {
            return new ResponseEntity<>("Session not found", HttpStatus.NOT_FOUND);
        }

        // 2. 접속하려는 유저 확인
        Long userId = Long.parseLong(params.get("userId").toString());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("유저가 없습니다."));

        // 3. 권한 부여 로직
        OpenViduRole role = OpenViduRole.PUBLISHER; // 기본: 일반 참가자

        // 유저 타입이 'ADMIN'이거나 'SHELTER'면 관리자(방장) 권한 부여
        if (user.getUserType() == UserType.shelter || user.getUserType() == UserType.admin) {
            role = OpenViduRole.MODERATOR;
        }
        // 4. 토큰 생성 옵션
        ConnectionProperties properties = new ConnectionProperties.Builder()
                .role(role)
                .data("user_name=" + user.getName()) // 화면에 닉네임 띄우기용
                .build();

        Connection connection = session.createConnection(properties);
        return new ResponseEntity<>(connection.getToken(), HttpStatus.OK);
    }
}