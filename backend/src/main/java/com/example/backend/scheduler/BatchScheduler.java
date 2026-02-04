package com.example.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final JobExplorer jobExplorer;
    private final Job updateDogDataJob;

    @Scheduled(cron = "0 0 0 * * *")
    public void runJob() {
        try {
            String jobName = updateDogDataJob.getName();

            if (!jobExplorer.findRunningJobExecutions(jobName).isEmpty()) {
                log.warn("[BatchScheduler] {} already running. Skip.", jobName);
                return;
            }

            JobParameters params = new JobParametersBuilder()
                    .addString("executedTime", LocalDateTime.now().toString())
                    .toJobParameters();

            log.info("[BatchScheduler] Start job={}", jobName);
            jobLauncher.run(updateDogDataJob, params);

        } catch (Exception e) {
            log.error("[BatchScheduler] 배치 실행 중 오류", e);
        }
    }
}
