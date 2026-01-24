package com.example.backend.repository.adoption.document;

import com.example.backend.domain.adoption.step_data.document.AdoptionDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdoptionDocumentRepository extends JpaRepository<AdoptionDocument, Long> {
    Optional<AdoptionDocument> findByStepInstanceId(Long stepInstanceId);
}
