package com.example.backend.api.adoption.dto.survey;

import com.example.backend.domain.adoption.enums.Gender; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MaritalStatus; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.MonthlyExpenseRange; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.PetPreference; // UPDATED IMPORT
import com.example.backend.domain.adoption.enums.ResidenceType; // UPDATED IMPORT
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class AdoptionSurveyRequest {

    // 개인정보
    @NotBlank(message = "이름은 필수입니다.")
    private String name;

    @NotNull(message = "생년월일은 필수입니다.")
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @NotNull(message = "성별은 필수입니다.")
    private Gender gender;

    @NotBlank(message = "연락처는 필수입니다.")
    private String phoneNumber;

    @NotBlank(message = "이메일은 필수입니다.")
    private String email;

    // 주소
    @NotBlank(message = "주소는 필수입니다.")
    private String address;

    @NotBlank(message = "상세 주소는 필수입니다.")
    private String detailAddress;

    // 가족
    @Valid
    private List<EmergencyContactRequest> emergencyContacts;

    // Pet Preference
    @NotNull(message = "입양 원하는 동물은 필수입니다.")
    private PetPreference petPreference;

    // 동거인
    @NotNull(message = "동거인 모두의 입양 동의 여부는 필수입니다.")
    private Boolean cohabitantAgreement;

    @NotNull(message = "동거인 유무는 필수입니다.")
    private Boolean hasCohabitant;

    @Valid
    private CohabitantCompositionRequest cohabitantComposition; // 동거인 수

    @Valid
    private List<CohabitantDetailRequest> cohabitantDetails; // 동거인 정보 (0명 이상)

    

    // 현재 반려동물
    @NotNull(message = "현재 반려동물 유무는 필수입니다.")
    private Boolean hasCurrentPets;

    @Valid
    private List<CurrentPetDetailRequest> currentPetDetails;

    // 이전 반려동물
    @NotNull(message = "이전 반려동물 양육 경험 유무는 필수입니다.")
    private Boolean hasPastPetExperience;

    @Valid
    private List<PastPetExperienceRequest> pastPetExperiences;

    // 주거 형태
    @NotNull(message = "주거 형태는 필수입니다.")
    private ResidenceType residenceType;

    @NotNull(message = "주거 공간 소유 여부는 필수입니다.")
    private Boolean isOwner;

    // 교육
    @NotNull(message = "소유자 교육 이수 여부는 필수입니다.")
    private Boolean completedOwnerEducation;

    // 책임감 동의
    @NotNull(message = "평생 함께할 반려동물 동의 여부는 필수입니다.")
    private Boolean agreesToLifetimeCommitment;

    @NotNull(message = "지자체 확인 동의 여부는 필수입니다.")
    private Boolean agreesToFollowUp;

    // 근무 정보
    @NotBlank(message = "직업은 필수입니다.")
    private String job;

    @NotBlank(message = "근무 시간은 필수입니다.")
    private String workingHours;

    @NotBlank(message = "아이가 집에 혼자 있는 시간 관리 방법은 필수입니다.")
    private String aloneTimeManagement;

    // 결혼 여부
    @NotNull(message = "결혼 여부는 필수입니다.")
    private MaritalStatus maritalStatus;

    // 반려동물 거주 공간
    @NotBlank(message = "반려동물이 거주할 공간 위치는 필수입니다.")
    private String petLivingSpaceLocation;

    private String petLivingSpacePhotoUrl; // Optional

    // Financial & Health Agreement
    @NotNull(message = "한달 지출 가능한 금액은 필수입니다.")
    private MonthlyExpenseRange monthlyExpenseRange;

    @NotNull(message = "반려동물 중성화 동의 여부는 필수입니다.")
    private Boolean agreesToNeutering;

    // Essays
    @NotBlank(message = "유기동물 입양 결심 계기와 신청 이유는 필수입니다.")
    @Size(min = 150, message = "유기동물 입양 결심 계기와 신청 이유는 150자 이상이어야 합니다.")
    private String motivationForAdoption;

    @NotBlank(message = "생활 변화 대처 계획은 필수입니다.")
    private String lifeChangeCopingPlan;

    @NotBlank(message = "집 비울 때 대처 계획은 필수입니다.")
    private String travelCopingPlan;

    @NotNull(message = "입양 후 소식 전달 동의 여부는 필수입니다.")
    private Boolean agreesToRegularUpdates;

    private String additionalQuestions; // Optional

    // Nested DTOs for embedded collections
    @Getter
    @Setter
    @NoArgsConstructor
    public static class EmergencyContactRequest {
        @NotBlank(message = "비상 연락처 이름은 필수입니다.")
        private String contactName;
        @NotBlank(message = "비상 연락처 전화번호는 필수입니다.")
        private String contactPhoneNumber;
        @NotBlank(message = "비상 연락처 관계는 필수입니다.")
        private String relationship;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CohabitantCompositionRequest { // Corresponds to domain.adoption.embed.CohabitantComposition
        @NotNull(message = "성인 동거인 수는 필수입니다.")
        private Integer numberOfAdults;
        private Integer numberOfChildren; // Optional
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CohabitantDetailRequest { // Corresponds to domain.adoption.embed.CohabitantDetail
        @NotBlank(message = "동거인과의 관계는 필수입니다.")
        private String relationship;
        @NotNull(message = "동거인 나이는 필수입니다.")
        private Integer age;
        @NotNull(message = "동물에 대한 알레르기 유무는 필수입니다.")
        private Boolean hasAllergy;
        @NotNull(message = "유기견 입양 동의 여부는 필수입니다.")
        private Boolean adoptionAgreement;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CurrentPetDetailRequest { // Corresponds to domain.adoption.embed.CurrentPetDetail
        @NotBlank(message = "반려동물 유형은 필수입니다.")
        private String petType;
        @NotBlank(message = "반려동물 품종은 필수입니다.")
        private String breed;
        @NotNull(message = "반려동물 마릿수는 필수입니다.")
        private Integer count;
        private Integer age; // Optional
        @NotNull(message = "반려동물 중성화 여부는 필수입니다.")
        private Boolean neutered;
        private String reasonForAdoptingMore; // Optional
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class PastPetExperienceRequest { // Corresponds to domain.adoption.embed.PastPetExperience
        @NotBlank(message = "과거 반려동물 유형은 필수입니다.")
        private String pastPetType;
        @NotNull(message = "과거 반려동물 마릿수는 필수입니다.")
        private Integer pastPetCount;
        @NotBlank(message = "양육 기간은 필수입니다.")
        private String duration;
        @NotNull(message = "현재 함께하는지 여부는 필수입니다.")
        private Boolean isCurrentlyWithYou;
        private String details; // Optional
    }
}
