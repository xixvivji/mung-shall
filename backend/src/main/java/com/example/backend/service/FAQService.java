package com.example.backend.service;

import com.example.backend.api.faq.dto.FAQRequest;
import com.example.backend.api.faq.dto.FAQResponse;
import com.example.backend.domain.faq.FAQ;
import com.example.backend.repository.FAQRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FAQService {

    private final FAQRepository faqRepository;

    @Transactional
    public FAQResponse createFaq(FAQRequest faqRequest) {
        FAQ faq = new FAQ(faqRequest.getQuestion(), faqRequest.getAnswer());
        faq = faqRepository.save(faq);
        return FAQResponse.fromEntity(faq);
    }

    public Page<FAQResponse> getAllFaqs(Pageable pageable) {
        Page<FAQ> faqs = faqRepository.findAll(pageable);
        return faqs.map(FAQResponse::fromEntity);
    }

    public FAQResponse getFaqById(Long id) {
        FAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다. ID: " + id));
        return FAQResponse.fromEntity(faq);
    }

    @Transactional
    public FAQResponse updateFaq(Long id, FAQRequest faqRequest) {
        FAQ faq = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ를 찾을 수 없습니다. ID: " + id));
        faq.update(faqRequest.getQuestion(), faqRequest.getAnswer());
        // No need to call save again, as the entity is managed by JPA and changes will be flushed.
        return FAQResponse.fromEntity(faq);
    }

    @Transactional
    public void deleteFaq(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new IllegalArgumentException("FAQ를 찾을 수 없습니다. ID: " + id);
        }
        faqRepository.deleteById(id);
    }
}
