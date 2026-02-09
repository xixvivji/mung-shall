package com.example.backend.api.faq.dto;

import com.example.backend.domain.faq.FAQ;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class FAQResponse {
    private Long id;
    private String question;
    private String answer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FAQResponse(FAQ faq) {
        this.id = faq.getId();
        this.question = faq.getQuestion();
        this.answer = faq.getAnswer();
        this.createdAt = faq.getCreatedAt();
        this.updatedAt = faq.getUpdatedAt();
    }

    public static FAQResponse fromEntity(FAQ faq) {
        return new FAQResponse(faq);
    }
}
