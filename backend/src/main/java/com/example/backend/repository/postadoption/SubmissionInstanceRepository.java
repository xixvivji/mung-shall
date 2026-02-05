package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.SubmissionInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmissionInstanceRepository extends JpaRepository<SubmissionInstance, Long> {
}
