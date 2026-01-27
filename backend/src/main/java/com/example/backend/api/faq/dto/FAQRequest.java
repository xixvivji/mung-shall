package com.example.backend.api.faq.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class FAQRequest {

    @NotBlank(message = "질문은 필수 입력값입니다.")
    private String question;

    @NotBlank(message = "답변은 필수 입력값입니다.")
    private String answer;
}
