package com.example.backend.api.adoption.dto.application;

import com.example.backend.domain.adoption.enums.Gender; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MaritalStatus; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MonthlyExpenseRange; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.PetPreference; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.ResidenceType; // UPDATED IMPORT
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AdoptionApplicationResponse {

    private Long id; // AdoptionApplication ID
    private Long stepInstanceId; // Associated AdoptionStepInstance ID

    // Personal Information
    private String name;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String phoneNumber;
    private String email;

    // Address
    private String address;
    private String detailAddress;

    // Family Contacts
    private List<EmergencyContactResponse> emergencyContacts;

    // Pet Preference
    private PetPreference petPreference;

    // Cohabitant Information
    private Boolean cohabitantAgreement;
    private Boolean hasCohabitant;
    private CohabitantCompositionResponse cohabitantComposition; // New: For counts of cohabitants
    private List<CohabitantDetailResponse> cohabitantDetails; // New: For individual cohabitant details
    

    // Current Pets
    private Boolean hasCurrentPets;
    private List<CurrentPetDetailResponse> currentPetDetails;

    // Past Pet Experience
    private Boolean hasPastPetExperience;
    private List<PastPetExperienceResponse> pastPetExperiences;

    // Residency Information
    private ResidenceType residenceType;
    private Boolean isOwner;

    // Education
    private Boolean completedOwnerEducation;

    // Commitment Agreement
    private Boolean agreesToLifetimeCommitment;
    private Boolean agreesToFollowUp;

    // Work Information
    private String job;
    private String workingHours;
    private String aloneTimeManagement;

    // Marital Status
    private MaritalStatus maritalStatus;

    // Pet Living Space
    private String petLivingSpaceLocation;
    private String petLivingSpacePhotoUrl;

    // Financial & Health Agreement
    private MonthlyExpenseRange monthlyExpenseRange;
    private Boolean agreesToNeutering;

    // Essays
    private String motivationForAdoption;
    private String lifeChangeCopingPlan;
    private String travelCopingPlan;
    private Boolean agreesToRegularUpdates;
    private String additionalQuestions;

    // Nested DTOs for embedded collections (Responses)
    @Getter
    @Setter
    @NoArgsConstructor
    public static class EmergencyContactResponse {
        private String contactName;
        private String contactPhoneNumber;
        private String relationship;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CohabitantCompositionResponse { // Corresponds to domain.adoption.embed.CohabitantComposition
        private Integer numberOfAdults;
        private Integer numberOfChildren;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CohabitantDetailResponse { // Corresponds to domain.adoption.embed.CohabitantDetail
        private String relationship;
        private Integer age;
        private Boolean hasAllergy;
        private Boolean adoptionAgreement;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CurrentPetDetailResponse {
        private String petType;
        private String breed;
        private Integer count;
        private Integer age;
        private Boolean neutered;
        private String reasonForAdoptingMore;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PastPetExperienceResponse {
        private String pastPetType;
        private Integer pastPetCount;
        private String duration;
        private Boolean isCurrentlyWithYou;
        private String details;
    }
}
