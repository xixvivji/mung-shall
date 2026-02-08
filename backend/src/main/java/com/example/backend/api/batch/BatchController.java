package com.example.backend.api.batch;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@Tag(name = "Batch API", description = "Manual batch triggers")
@RestController
@RequestMapping("/api/batch")
@RequiredArgsConstructor
public class BatchController {

    private final JobLauncher jobLauncher;
    private final JobExplorer jobExplorer;
    private final Job updateDogDataJob;

    @Operation(summary = "Trigger updateDogDataJob")
    @PostMapping("/update-dog-data")
    public ResponseEntity<?> runUpdateDogDataJob() {
        String jobName = updateDogDataJob.getName();
        if (!jobExplorer.findRunningJobExecutions(jobName).isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "job already running"));
        }

        JobParameters params = new JobParametersBuilder()
                .addString("executedTime", LocalDateTime.now().toString())
                .toJobParameters();

        try {
            JobExecution execution = jobLauncher.run(updateDogDataJob, params);
            return ResponseEntity.accepted().body(Map.of(
                    "jobExecutionId", execution.getId(),
                    "status", execution.getStatus().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "failed to start job"));
        }
    }
}
