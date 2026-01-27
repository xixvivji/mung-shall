package com.example.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendVerificationCode(String to, String code, LocalDateTime expiresAt) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy년 M월 d일 HH시 mm분");
        String formattedExpireTime = expiresAt.format(formatter);

        String subject = "[멍쉘] 이메일 인증 코드입니다";
        String html = """
                <div style="font-family: Arial, sans-serif; line-height:1.6">
                  <h2>멍쉘 이메일 인증</h2>
                  <p>아래 인증 코드를 입력해 주세요.</p>
                  <div style="font-size:28px; font-weight:bold; letter-spacing:2px; margin:16px 0">
                    %s
                  </div>
                  <p><b>%s</b> 까지 유효합니다.</p>
                  <p style="color:#888; font-size:12px">본 메일은 발신 전용입니다.</p>
                </div>
                """.formatted(code, formattedExpireTime);

        sendHtml(to, subject, html);
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            helper.setFrom(fromEmail);

            mailSender.send(message);
        } catch (Exception e) {
            throw new IllegalStateException("메일 발송에 실패했습니다.", e);
        }
    }
}
