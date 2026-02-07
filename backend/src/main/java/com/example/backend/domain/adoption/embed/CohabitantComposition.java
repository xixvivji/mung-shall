package com.example.backend.domain.adoption.embed;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class CohabitantComposition {
    private Integer numberOfAdults;
    private Integer numberOfChildren;
}
