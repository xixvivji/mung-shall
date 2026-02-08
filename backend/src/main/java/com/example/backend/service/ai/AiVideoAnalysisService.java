package com.example.backend.service.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class AiVideoAnalysisService {

    @Qualifier("aiRestTemplate")
    private final RestTemplate aiRestTemplate;

    @Value("${app.ai.base-url}")
    private String baseUrl;

    @Value("${app.ai.analyze-video-path}")
    private String analyzeVideoPath;

    public ResponseEntity<byte[]> analyzeVideo(
            MultipartFile file,
            String targetAction,
            double targetDuration
    ) {
        String url = buildUrl(baseUrl, analyzeVideoPath);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", toFileResource(file));
        body.add("target_action", targetAction);
        body.add("target_duration", Double.toString(targetDuration));

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        return aiRestTemplate.exchange(url, HttpMethod.POST, requestEntity, byte[].class);
    }

    private String buildUrl(String base, String path) {
        if (base.endsWith("/") && path.startsWith("/")) {
            return base.substring(0, base.length() - 1) + path;
        }
        if (!base.endsWith("/") && !path.startsWith("/")) {
            return base + "/" + path;
        }
        return base + path;
    }

    private HttpEntity<InputStreamResource> toFileResource(MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            InputStreamResource resource = new NamedInputStreamResource(
                    inputStream,
                    file.getOriginalFilename(),
                    file.getSize()
            );

            HttpHeaders partHeaders = new HttpHeaders();
            if (file.getContentType() != null && !file.getContentType().isBlank()) {
                partHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));
            }

            return new HttpEntity<>(resource, partHeaders);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read video file stream.", e);
        }
    }

    private static class NamedInputStreamResource extends InputStreamResource {
        private final String filename;
        private final long contentLength;

        private NamedInputStreamResource(InputStream inputStream, String filename, long contentLength) {
            super(inputStream);
            this.filename = filename;
            this.contentLength = contentLength;
        }

        @Override
        public String getFilename() {
            return filename != null ? filename : "video.mp4";
        }

        @Override
        public long contentLength() {
            return contentLength >= 0 ? contentLength : -1;
        }
    }
}
