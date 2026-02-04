package com.example.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class BatchScheduler {

    private final JobLauncher jobLauncher;
    private final JobExplorer jobExplorer;      // ✅ 실행 중 검사에 필요
    private final Job updateDogDataJob;

    @Scheduled(cron = "0 0 0 * * *")
    public void runJob() {
        try {
            if (!jobExplorer.findRunningJobExecutions(updateDogDataJob.getName()).isEmpty()) {
                log.warn("[BatchScheduler] {} already running. Skip.", updateDogDataJob.getName());
                return;
            }
            // 기존 실행 코드 그대로
        } catch (Exception e) {
            log.error("[BatchScheduler] 배치 실행 중 오류", e);
        }
    }
}
