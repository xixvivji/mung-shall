package com.example.backend.repository.postadoption;

import com.example.backend.domain.postadoption.ChecklistItemInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChecklistItemInstanceRepository extends JpaRepository<ChecklistItemInstance, Long> {
}
