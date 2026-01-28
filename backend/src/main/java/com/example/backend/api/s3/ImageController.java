package com.example.backend.api.s3;

import com.example.backend.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    // 테스트용 업로드 API
    @PostMapping("/upload")
    public ResponseEntity<?> uploadTest(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("파일이 비어있습니다.");
            }

            // S3에 업로드하고 URL 받아오기
            String imageUrl = s3Service.uploadFile(file);

            // 결과 리턴 (JSON 형식)
            Map<String, String> response = new HashMap<>();
            response.put("message", "업로드 성공!");
            response.put("url", imageUrl);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("업로드 실패: " + e.getMessage());
        }
    }
}