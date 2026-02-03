package com.example.backend.domain.adoption.step.survey;

import com.example.backend.domain.adoption.enums.Gender; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MaritalStatus; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MonthlyExpenseRange; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.PetPreference; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.ResidenceType; // UPDATED IMPORT
import com.example.backend.domain.adoption.embed.CohabitantComposition;
import com.example.backend.domain.adoption.embed.CohabitantDetail;
import com.example.backend.domain.adoption.embed.CurrentPetDetail;
import com.example.backend.domain.adoption.embed.EmergencyContactInfo;
import com.example.backend.domain.adoption.embed.PastPetExperience;
import com.example.backend.domain.adoption.AdoptionStepInstance; // UPDATED IMPORT

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "adoption_survey")
@Getter
@Setter
@NoArgsConstructor
public class AdoptionSurvey {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private AdoptionStepInstance stepInstance;

    // Personal Information
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String email;

    // Address
    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String detailAddress;

    // Family Contacts (can be multiple)
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "adoption_survey_emergency_contact", joinColumns = @JoinColumn(name = "adoption_survey_id"))
    private List<EmergencyContactInfo> emergencyContacts = new ArrayList<>();

    // Pet Preference
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetPreference petPreference;

    // Cohabitant Information
    @Column(nullable = false)
    private Boolean cohabitantAgreement; // 반려동물 입양에 대해 동거인 모두가 동의하셨습니까?

    @Column(nullable = false)
    private Boolean hasCohabitant; // 함께 사는 동거인이 있으신가요?

    @Embedded // For counts of cohabitants
    private CohabitantComposition cohabitantComposition;

    @ElementCollection(fetch = FetchType.LAZY) // For individual cohabitant details
    @CollectionTable(name = "adoption_survey_cohabitant_detail", joinColumns = @JoinColumn(name = "adoption_survey_id"))
    private List<CohabitantDetail> cohabitantDetails = new ArrayList<>();

    

    // Current Pets
    @Column(nullable = false)
    private Boolean hasCurrentPets; // 현재 함께하고 있는 반려동물이 있으신가요?

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "adoption_survey_current_pet_detail", joinColumns = @JoinColumn(name = "adoption_survey_id"))
    private List<CurrentPetDetail> currentPetDetails = new ArrayList<>();

    // Past Pet Experience
    @Column(nullable = false)
    private Boolean hasPastPetExperience; // 이전에 반려동물을 양육한 경험이 있으신가요?

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "adoption_survey_past_pet_experience", joinColumns = @JoinColumn(name = "adoption_survey_id"))
    private List<PastPetExperience> pastPetExperiences = new ArrayList<>();

    // Residency Information
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResidenceType residenceType; // 주거형태

    @Column(nullable = false)
    private Boolean isOwner; // 주거 공간이 본인 소유인가요?

    // Education
    @Column(nullable = false)
    private Boolean completedOwnerEducation; // 동물보호복지 온라인 교육시스템(동물사랑배움터)에서 소유자 교육을 이수하셨나요?

    // Commitment Agreement
    @Column(nullable = false)
    private Boolean agreesToLifetimeCommitment; // 평생 함게할 반려동물이라고 생각하고 입양에 동의하십니까?

    @Column(nullable = false)
    private Boolean agreesToFollowUp; // 필요할 경우 담당 지자체에서 입양된 동물이 어떻게 지내는지 확인하거나 사진 등을 요구하는 것에 동의하십니까?

    // Work Information
    @Column(nullable = false)
    private String job; // 직업 (기존 필드, nullable=false 유지)

    @Column(nullable = false)
    private String workingHours; // 근무 시간

    @Column(columnDefinition = "TEXT", nullable = false)
    private String aloneTimeManagement; // 아이가 집에 혼자 있는 시간과 아이가 혼자 있는 시간동안 어떻게 관리할 것인지 알려주세요

    // Marital Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaritalStatus maritalStatus; // 결혼 여부

    // Pet Living Space
    @Column(nullable = false)
    private String petLivingSpaceLocation; // 반려동물이 거주할 공간 위치

    private String petLivingSpacePhotoUrl; // 반려동물 거주 공간 사진 (URL)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MonthlyExpenseRange monthlyExpenseRange; // 반려동물을 위해 한달 지출 가능한 금액?

    @Column(nullable = false)
    private Boolean agreesToNeutering; // 반려동물 중성화에 동의하시나요?

    // Essays
    @Column(columnDefinition = "TEXT", nullable = false)
    private String motivationForAdoption; // 유기동물 입양을 결심한 계기와 이 동물을 입양 신청한 이유 (150자 이상)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String lifeChangeCopingPlan; // 결혼, 출산, 이민 등 생활의 변화가 생길 경우 어떻게 대처하시겠어요?

    @Column(columnDefinition = "TEXT", nullable = false)
    private String travelCopingPlan; // 여행, 명절, 휴가 등 집을 비울 때 어떻게 대처하시겠어요?

    @Column(nullable = false)
    private Boolean agreesToRegularUpdates; // 입양 후 꾸준히 소식을 전해주실건가요?

    @Column(columnDefinition = "TEXT")
    private String additionalQuestions; // 추가로 궁금한 점
}