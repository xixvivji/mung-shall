import com.example.backend.api.postadoption.dto.videocall.VideoCallOpenRoomRequest;
import com.example.backend.service.postadoption.PostAdoptionVideoCallService;
import io.openvidu.java.client.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.util.Map;

@Tag(name = "OpenVidu API", description = "화상 채팅 세션 생성 및 입장 토큰 발급 컨트롤러")
@RestController
@RequestMapping("/api/openvidu")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class OpenViduController {

    private final PostAdoptionVideoCallService postAdoptionVideoCallService;

    @Value("${openvidu.url}")
    private String OPENVIDU_URL;

    @Value("${openvidu.secret}")
    private String OPENVIDU_SECRET;

    private OpenVidu openVidu;

    @PostConstruct
    public void init() {
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
            System.err.println(" SSL 설정 실패: " + e.getMessage());
        }

        this.openVidu = new OpenVidu(OPENVIDU_URL, OPENVIDU_SECRET);
    }

    @Operation(summary = "화상 채팅방(세션) 생성", description = "새로운 OpenVidu 세션을 생성하고 세션 ID를 반환합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "세션 생성 성공 (Session ID 반환)"),
            @ApiResponse(responseCode = "409", description = "이미 존재하는 세션 ID (기존 ID 반환)"),
            @ApiResponse(responseCode = "500", description = "OpenVidu 서버 에러")
    })
    @PostMapping("/sessions")
    public ResponseEntity<String> initializeSession(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "세션 설정 파라미터 (선택 사항)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"customSessionId\": \"postcare_1_1\"}")
                    )
            )
            @RequestBody(required = false) Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {

        SessionProperties properties = SessionProperties.fromJson(params).build();

        try {
            Session session = openVidu.createSession(properties);
            return new ResponseEntity<>(session.getSessionId(), HttpStatus.OK);
        } catch (OpenViduHttpException e) {
            if (e.getStatus() == 409) {
                // 이미 존재하는 세션이면 해당 ID 반환
                return new ResponseEntity<>((String) params.get("customSessionId"), HttpStatus.OK);
            }
            throw e;
        }
    }

    @Operation(summary = "화상 채팅 입장 토큰 발급", description = "특정 세션에 접속할 수 있는 유저별 토큰을 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "토큰 발급 성공 (wss://... 형식)"),
            @ApiResponse(responseCode = "404", description = "해당 세션을 찾을 수 없음")
    })
    @PostMapping("/sessions/{sessionId}/connections")
    public ResponseEntity<String> createConnection(
            @Parameter(description = "접속할 세션의 ID (예: postcare_1_1)", required = true)
            @PathVariable("sessionId") String sessionId,

            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "연결 설정 파라미터 (선택 사항)",
                    content = @Content(
                            mediaType = "application/json",
                            examples = @ExampleObject(value = "{\"role\": \"PUBLISHER\", \"data\": \"user_id_2\"}")
                    )
            )
            @RequestBody(required = false) Map<String, Object> params)
            throws OpenViduJavaClientException, OpenViduHttpException {

        Session session = openVidu.getActiveSession(sessionId);

        if (session == null) {
            return new ResponseEntity<>("Session not found", HttpStatus.NOT_FOUND);
        }

        ConnectionProperties properties = ConnectionProperties.fromJson(params).build();

        Connection connection = session.createConnection(properties);
        return new ResponseEntity<>(connection.getToken(), HttpStatus.OK);
    }
}