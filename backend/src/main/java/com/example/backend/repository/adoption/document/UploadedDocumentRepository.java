package com.example.backend.repository.adoption.document;

import com.example.backend.domain.adoption.step.document.UploadedDocument;
import com.example.backend.domain.adoption.enums.DocumentType;
import com.example.backend.domain.adoption.step.document.AdoptionDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, Long> {
    Optional<UploadedDocument> findByAdoptionDocumentAndDocumentType(AdoptionDocument adoptionDocument, DocumentType documentType);
}
