package com.example.backend.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
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
    private final Job updateDogDataJob;

    @Scheduled(cron = "0 0 0 * * *")
    public void runJob() {
        try {
            log.info("[BatchScheduler] 유기견 데이터 갱신 배치를 시작합니다.");

            // Spring Batch는 JobParameters가 동일하면 중복 실행으로 간주하고 실행하지 않음
            // 매일 실행되게 하려면 시간 정보를 파라미터로 넣어야 함
            JobParameters jobParameter = new JobParametersBuilder()
                    .addString("executedTime", LocalDateTime.now().toString())
                    .toJobParameters();

            jobLauncher.run(updateDogDataJob, jobParameter);

        } catch(Exception e) {
            log.error("[BatchScheduler] 유기견 데이터 갱신 배치 실행 중 오류 발생 : {}", e.getMessage());
        }
    }

}
