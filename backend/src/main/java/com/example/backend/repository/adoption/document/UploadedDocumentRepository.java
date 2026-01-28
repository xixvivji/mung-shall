package com.example.backend.repository.adoption.document;

import com.example.backend.domain.adoption.step.document.UploadedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, Long> {
}
