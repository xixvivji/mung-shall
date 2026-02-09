package com.example.backend.domain.adoption;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "adoption_step_def")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionStepDef {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer stepOrder;

    @Column(nullable = false, unique = true)
    private String stepName;

    @Column(columnDefinition = "TEXT")
    private String description;
}
