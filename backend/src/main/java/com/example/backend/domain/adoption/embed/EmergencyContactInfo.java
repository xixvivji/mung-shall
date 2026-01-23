package com.example.backend.domain.adoption.embed;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class EmergencyContactInfo {

    @Column(nullable = false)
    private String contactName;

    @Column(nullable = false)
    private String contactPhoneNumber;

    @Column(nullable = false)
    private String relationship;
}
