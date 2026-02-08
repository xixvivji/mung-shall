package com.example.backend.service.ai;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;

@Service
@RequiredArgsConstructor
public class AiVideoAnalysisJobService {

    private static final String DEFAULT_FILENAME = "video.mp4";
    private static final int ERROR_MAX_LEN = 2000;

    private final AiVideoAnalysisService aiVideoAnalysisService;
    @Qualifier("videoAnalysisTaskExecutor")
    private final Executor videoAnalysisTaskExecutor;

    @Value("${app.ai.analysis.result-ttl-minutes:60}")
    private long resultTtlMinutes;

    private final Map<String, Job> jobs = new ConcurrentHashMap<>();

    public JobView submitJob(
            long postAdoptionId,
            MultipartFile file,
            String targetAction,
            double targetDuration
    ) {
        Path inputPath = storeInputFile(file);
        String jobId = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String safeFilename = (originalFilename == null || originalFilename.isBlank())
                ? DEFAULT_FILENAME
                : originalFilename;

        Job job = new Job(
                jobId,
                postAdoptionId,
                inputPath,
                safeFilename,
                file.getContentType(),
                file.getSize(),
                targetAction,
                targetDuration
        );
        jobs.put(jobId, job);
        videoAnalysisTaskExecutor.execute(() -> runJob(job));
        return toView(job);
    }

    public JobView getJobView(long postAdoptionId, String jobId) {
        Job job = jobs.get(jobId);
        if (job == null || job.postAdoptionId != postAdoptionId) {
            return null;
        }
        if (job.isExpired()) {
            cleanupJob(jobId, job);
            return null;
        }
        return toView(job);
    }

    public DownloadPayload loadResult(long postAdoptionId, String jobId) {
        Job job = jobs.get(jobId);
        if (job == null || job.postAdoptionId != postAdoptionId) {
            return null;
        }
        if (job.isExpired()) {
            cleanupJob(jobId, job);
            return null;
        }
        if (job.status != Status.SUCCEEDED || job.resultPath == null) {
            return null;
        }
        try {
            byte[] body = Files.readAllBytes(job.resultPath);
            return new DownloadPayload(
                    body,
                    job.resultContentType,
                    job.resultContentDisposition,
                    job.analysisHeader
            );
        } catch (IOException e) {
            job.fail("Failed to read analysis result: " + e.getMessage());
            return null;
        }
    }

    private void runJob(Job job) {
        job.status = Status.PROCESSING;
        try {
            ResponseEntity<byte[]> response = aiVideoAnalysisService.analyzeVideo(
                    job.inputPath,
                    job.inputFilename,
                    job.inputContentType,
                    job.inputSize,
                    job.targetAction,
                    job.targetDuration
            );
            byte[] body = response.getBody();
            if (body == null || body.length == 0) {
                throw new IllegalStateException("AI analysis returned empty body.");
            }
            Path resultPath = Files.createTempFile("analysis-result-", ".bin");
            Files.write(resultPath, body);
            job.resultPath = resultPath;
            MediaType contentType = response.getHeaders().getContentType();
            job.resultContentType = contentType != null ? contentType.toString() : null;
            job.resultContentDisposition = response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION);
            if (job.resultContentDisposition == null) {
                job.resultContentDisposition = "attachment; filename=\"analysis-" + job.inputFilename + "\"";
            }
            job.analysisHeader = response.getHeaders().getFirst("X-Analysis-Result");
            job.status = Status.SUCCEEDED;
        } catch (Exception e) {
            job.fail(e.getMessage());
        } finally {
            job.setExpiry(Duration.ofMinutes(resultTtlMinutes));
            job.deleteInputFile();
        }
    }

    private Path storeInputFile(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null) {
            int dot = originalFilename.lastIndexOf('.');
            if (dot >= 0) {
                extension = originalFilename.substring(dot);
            }
        }
        try {
            Path tempFile = Files.createTempFile("analysis-upload-", extension);
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);
            return tempFile;
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store uploaded file.", e);
        }
    }

    private void cleanupJob(String jobId, Job job) {
        jobs.remove(jobId);
        if (job != null) {
            job.deleteResultFile();
        }
    }

    private JobView toView(Job job) {
        return new JobView(job.jobId, job.status, job.error);
    }

    public enum Status {
        QUEUED,
        PROCESSING,
        SUCCEEDED,
        FAILED
    }

    public static class JobView {
        @Getter
        private final String jobId;
        @Getter
        private final Status status;
        @Getter
        private final String error;

        private JobView(String jobId, Status status, String error) {
            this.jobId = jobId;
            this.status = status;
            this.error = error;
        }
    }

    public static class DownloadPayload {
        @Getter
        private final byte[] body;
        @Getter
        private final String contentType;
        @Getter
        private final String contentDisposition;
        @Getter
        private final String analysisHeader;

        private DownloadPayload(
                byte[] body,
                String contentType,
                String contentDisposition,
                String analysisHeader
        ) {
            this.body = body;
            this.contentType = contentType;
            this.contentDisposition = contentDisposition;
            this.analysisHeader = analysisHeader;
        }
    }

    private static class Job {
        private final String jobId;
        private final long postAdoptionId;
        private final Path inputPath;
        private final String inputFilename;
        private final String inputContentType;
        private final long inputSize;
        private final String targetAction;
        private final double targetDuration;
        private volatile Status status;
        private volatile String error;
        private volatile Path resultPath;
        private volatile String resultContentType;
        private volatile String resultContentDisposition;
        private volatile String analysisHeader;
        private volatile Instant expiresAt;

        private Job(
                String jobId,
                long postAdoptionId,
                Path inputPath,
                String inputFilename,
                String inputContentType,
                long inputSize,
                String targetAction,
                double targetDuration
        ) {
            this.jobId = jobId;
            this.postAdoptionId = postAdoptionId;
            this.inputPath = inputPath;
            this.inputFilename = inputFilename;
            this.inputContentType = inputContentType;
            this.inputSize = inputSize;
            this.targetAction = targetAction;
            this.targetDuration = targetDuration;
            this.status = Status.QUEUED;
        }

        private void setExpiry(Duration ttl) {
            this.expiresAt = Instant.now().plus(ttl);
        }

        private boolean isExpired() {
            return expiresAt != null && Instant.now().isAfter(expiresAt);
        }

        private void deleteInputFile() {
            if (inputPath == null) {
                return;
            }
            try {
                Files.deleteIfExists(inputPath);
            } catch (IOException ignored) {
            }
        }

        private void deleteResultFile() {
            if (resultPath == null) {
                return;
            }
            try {
                Files.deleteIfExists(resultPath);
            } catch (IOException ignored) {
            }
        }

        private void fail(String message) {
            this.error = abbreviate(message, ERROR_MAX_LEN);
            this.status = Status.FAILED;
        }
    }

    private static String abbreviate(String value, int maxLen) {
        if (value == null) {
            return "null";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLen) {
            return normalized;
        }
        return normalized.substring(0, maxLen) + "...";
    }
}
