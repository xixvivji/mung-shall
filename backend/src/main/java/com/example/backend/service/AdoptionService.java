package com.example.backend.service;

import com.example.backend.api.adoption.dto.AdoptionApplicationRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationRequest.CohabitantCompositionRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationRequest.CohabitantDetailRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationRequest.CurrentPetDetailRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationRequest.EmergencyContactRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationRequest.PastPetExperienceRequest;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse.CohabitantCompositionResponse;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse.CohabitantDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse.CurrentPetDetailResponse;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse.EmergencyContactResponse;
import com.example.backend.api.adoption.dto.AdoptionApplicationResponse.PastPetExperienceResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionProcessStatus;
import com.example.backend.domain.adoption.AdoptionStepDef;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.AdoptionStepStatus;
import com.example.backend.domain.adoption.embed.CohabitantComposition;
import com.example.backend.domain.adoption.embed.CohabitantDetail;
import com.example.backend.domain.adoption.embed.CurrentPetDetail;
import com.example.backend.domain.adoption.embed.EmergencyContactInfo;
import com.example.backend.domain.adoption.embed.PastPetExperience;
import com.example.backend.domain.adoption.step_data.AdoptionApplication;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.user.User;
import com.example.backend.repository.AbandonedDogRepository;
import com.example.backend.repository.AdoptionApplicationRepository;
import com.example.backend.repository.AdoptionRepository;
import com.example.backend.repository.AdoptionStepDefRepository;
import com.example.backend.repository.AdoptionStepInstanceRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepDefRepository adoptionStepDefRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionApplicationRepository adoptionApplicationRepository;
    private final UserRepository userRepository;
    private final AbandonedDogRepository abandonedDogRepository;

    /**
     * 초기 입양 프로세스를 생성합니다.
     * 사용자가 '입양하기' 버튼을 눌렀을 때 호출됩니다.
     * Adoption 엔티티와 모든 AdoptionStepInstance를 생성하고 첫 단계를 활성화합니다.
     *
     * @param userId          입양 신청 사용자 ID
     * @param abandonedDogId  입양 대상 유기견 ID
     * @return 생성된 Adoption의 ID
     */
    public Long createAdoptionProcess(Long userId, Long abandonedDogId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        AbandonedDog dog = abandonedDogRepository.findById(abandonedDogId)
                .orElseThrow(() -> new IllegalArgumentException("AbandonedDog not found with ID: " + abandonedDogId));

        // 이미 해당 유저-강아지 조합으로 입양 신청이 있는지 확인
        if (adoptionRepository.findByUser_UserIdAndAbandonedDog_Id(userId, abandonedDogId).isPresent()) {
            throw new IllegalArgumentException("이미 해당 유기견에 대한 입양 신청 프로세스가 존재합니다.");
        }

        Adoption adoption = new Adoption();
        adoption.setUser(user);
        adoption.setAbandonedDog(dog);
        adoption.setProcessStatus(AdoptionProcessStatus.PENDING); // 초기 상태는 PENDING
        adoptionRepository.save(adoption);

        // 모든 StepDef를 가져와 StepInstance 생성
        List<AdoptionStepDef> stepDefs = adoptionStepDefRepository.findAllByOrderByStepOrderAsc();
        if (stepDefs.isEmpty()) {
            throw new IllegalStateException("입양 단계 정의(AdoptionStepDef)가 설정되어 있지 않습니다.");
        }

        AdoptionStepInstance firstStepInstance = null;
        for (AdoptionStepDef stepDef : stepDefs) {
            AdoptionStepInstance stepInstance = new AdoptionStepInstance();
            stepInstance.setAdoption(adoption);
            stepInstance.setStepDef(stepDef);
            stepInstance.setStatus(AdoptionStepStatus.NOT_STARTED);

            // 첫 번째 단계 활성화
            if (stepDef.getStepOrder() == 1) {
                stepInstance.setStatus(AdoptionStepStatus.PENDING); // 첫 단계는 PENDING 상태로 시작하여 제출 대기
                firstStepInstance = stepInstance;
            }
            adoption.addStep(stepInstance); // Adoption 엔티티의 addStep 헬퍼 메서드 사용
        }
        adoptionRepository.save(adoption); // cascade 때문에 모든 stepInstances가 함께 저장됨

        if (firstStepInstance == null) {
            throw new IllegalStateException("첫 번째 입양 단계 인스턴스를 찾을 수 없습니다.");
        }

        return adoption.getId();
    }

    /**
     * 입양 신청서 상세 정보를 제출하거나 수정합니다.
     * 첫 번째 단계인 '입양 신청서 제출' 단계에서 호출됩니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param request    입양 신청서 요청 DTO
     * @return 저장되거나 업데이트된 AdoptionApplication의 응답 DTO
     */
    public AdoptionApplicationResponse submitAdoptionApplication(Long adoptionId, AdoptionApplicationRequest request) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        // '입양 신청서 제출' 단계 인스턴스 찾기
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepName(adoptionId, "입양 신청서 제출") // StepDef의 stepName과 일치해야 함
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서 제출 단계를 찾을 수 없습니다."));

        // 현재 단계가 PENDING 상태인지 확인 (SUBMITTED 상태에서는 수정 가능)
        if (applicationStep.getStatus() != AdoptionStepStatus.PENDING &&
                applicationStep.getStatus() != AdoptionStepStatus.SUBMITTED &&
                applicationStep.getStatus() != AdoptionStepStatus.REJECTED) { // 반려되었을 경우 재제출 가능
            throw new IllegalStateException("입양 신청서 제출 단계가 현재 '제출 대기' 또는 '반려' 상태가 아닙니다.");
        }

        AdoptionApplication application = adoptionApplicationRepository.findByStepInstanceId(applicationStep.getId())
                .orElse(new AdoptionApplication()); // 없으면 새로 생성

        // Request DTO -> Entity 매핑
        mapRequestToAdoptionApplication(request, application);
        application.setStepInstance(applicationStep); // OneToOne 관계 설정

        adoptionApplicationRepository.save(application);

        // 단계 상태 업데이트
        applicationStep.setStatus(AdoptionStepStatus.SUBMITTED);
        applicationStep.setSubmittedAt(LocalDateTime.now());
        adoptionStepInstanceRepository.save(applicationStep);

        return mapAdoptionApplicationToResponse(application);
    }

    /**
     * 특정 입양 프로세스의 입양 신청서 상세 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 입양 신청서 응답 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionApplicationResponse getAdoptionApplication(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepName(adoptionId, "입양 신청서 제출")
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서 제출 단계를 찾을 수 없습니다."));

        AdoptionApplication application = adoptionApplicationRepository.findByStepInstanceId(applicationStep.getId())
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서가 존재하지 않습니다."));

        return mapAdoptionApplicationToResponse(application);
    }

    /**
     * 입양 프로세스를 취소합니다.
     *
     * @param adoptionId 취소할 입양 프로세스 ID
     */
    public void cancelAdoptionProcess(Long adoptionId) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("Adoption not found with ID: " + adoptionId));

        if (adoption.getProcessStatus() == AdoptionProcessStatus.COMPLETED ||
            adoption.getProcessStatus() == AdoptionProcessStatus.CANCELLED) {
            throw new IllegalStateException("이미 완료되었거나 취소된 입양 프로세스는 취소할 수 없습니다.");
        }

        adoption.setProcessStatus(AdoptionProcessStatus.CANCELLED);
        adoptionRepository.save(adoption);

        // 모든 단계 인스턴스 상태도 CANCELLED로 변경
        List<AdoptionStepInstance> stepInstances = adoptionStepInstanceRepository.findByAdoptionIdOrderByStepDefStepOrderAsc(adoptionId);
        for (AdoptionStepInstance stepInstance : stepInstances) {
            if (stepInstance.getStatus() != AdoptionStepStatus.COMPLETED) { // 완료된 단계는 유지
                stepInstance.setStatus(AdoptionStepStatus.CANCELLED);
                adoptionStepInstanceRepository.save(stepInstance);
            }
        }
    }

    // --- Mapper methods ---

    private void mapRequestToAdoptionApplication(AdoptionApplicationRequest request, AdoptionApplication application) {
        // Personal Information
        application.setName(request.getName());
        application.setDateOfBirth(request.getDateOfBirth());
        application.setGender(request.getGender());
        application.setPhoneNumber(request.getPhoneNumber());
        application.setEmail(request.getEmail());

        // Address
        application.setAddress(request.getAddress());
        application.setDetailAddress(request.getDetailAddress());

        // Family Contacts
        if (request.getEmergencyContacts() != null) {
            application.getEmergencyContacts().clear();
            application.getEmergencyContacts().addAll(
                request.getEmergencyContacts().stream()
                       .map(AdoptionService::mapEmergencyContactRequestToEmbeddable)
                       .collect(Collectors.toList())
            );
        }

        // Pet Preference
        application.setPetPreference(request.getPetPreference());

        // Cohabitant Information
        application.setCohabitantAgreement(request.getCohabitantAgreement());
        application.setHasCohabitant(request.getHasCohabitant());
        if (request.getCohabitantComposition() != null) {
            application.setCohabitantComposition(mapCohabitantCompositionRequestToEmbeddable(request.getCohabitantComposition()));
        }
        if (request.getCohabitantDetails() != null) {
            application.getCohabitantDetails().clear();
            application.getCohabitantDetails().addAll(
                request.getCohabitantDetails().stream()
                       .map(AdoptionService::mapCohabitantDetailRequestToEmbeddable)
                       .collect(Collectors.toList())
            );
        }
        application.setCohabitantAllergy(request.getCohabitantAllergy());

        // Current Pets
        application.setHasCurrentPets(request.getHasCurrentPets());
        if (request.getCurrentPetDetails() != null) {
            application.getCurrentPetDetails().clear();
            application.getCurrentPetDetails().addAll(
                request.getCurrentPetDetails().stream()
                       .map(AdoptionService::mapCurrentPetDetailRequestToEmbeddable)
                       .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        application.setHasPastPetExperience(request.getHasPastPetExperience());
        if (request.getPastPetExperiences() != null) {
            application.getPastPetExperiences().clear();
            application.getPastPetExperiences().addAll(
                request.getPastPetExperiences().stream()
                       .map(AdoptionService::mapPastPetExperienceRequestToEmbeddable)
                       .collect(Collectors.toList())
            );
        }

        // Residency Information
        application.setResidenceType(request.getResidenceType());
        application.setIsOwner(request.getIsOwner());

        // Education
        application.setCompletedOwnerEducation(request.getCompletedOwnerEducation());

        // Commitment Agreement
        application.setAgreesToLifetimeCommitment(request.getAgreesToLifetimeCommitment());
        application.setAgreesToFollowUp(request.getAgreesToFollowUp());

        // Work Information
        application.setJob(request.getJob());
        application.setWorkingHours(request.getWorkingHours());
        application.setAloneTimeManagement(request.getAloneTimeManagement());

        // Marital Status
        application.setMaritalStatus(request.getMaritalStatus());

        // Pet Living Space
        application.setPetLivingSpaceLocation(request.getPetLivingSpaceLocation());
        application.setPetLivingSpacePhotoUrl(request.getPetLivingSpacePhotoUrl());

        // Financial & Health Agreement
        application.setMonthlyExpenseRange(request.getMonthlyExpenseRange());
        application.setAgreesToNeutering(request.getAgreesToNeutering());

        // Essays
        application.setMotivationForAdoption(request.getMotivationForAdoption());
        application.setLifeChangeCopingPlan(request.getLifeChangeCopingPlan());
        application.setTravelCopingPlan(request.getTravelCopingPlan());
        application.setAgreesToRegularUpdates(request.getAgreesToRegularUpdates());
        application.setAdditionalQuestions(request.getAdditionalQuestions());
    }

    private AdoptionApplicationResponse mapAdoptionApplicationToResponse(AdoptionApplication application) {
        AdoptionApplicationResponse response = new AdoptionApplicationResponse();
        response.setId(application.getId());
        response.setStepInstanceId(application.getStepInstance().getId());

        // Personal Information
        response.setName(application.getName());
        response.setDateOfBirth(application.getDateOfBirth());
        response.setGender(application.getGender());
        response.setPhoneNumber(application.getPhoneNumber());
        response.setEmail(application.getEmail());

        // Address
        response.setAddress(application.getAddress());
        response.setDetailAddress(application.getDetailAddress());

        // Family Contacts
        if (application.getEmergencyContacts() != null) {
            response.setEmergencyContacts(
                application.getEmergencyContacts().stream()
                           .map(AdoptionService::mapEmergencyContactEmbeddableToResponse)
                           .collect(Collectors.toList())
            );
        }

        // Pet Preference
        response.setPetPreference(application.getPetPreference());

        // Cohabitant Information
        response.setCohabitantAgreement(application.getCohabitantAgreement());
        response.setHasCohabitant(application.getHasCohabitant());
        if (application.getCohabitantComposition() != null) {
            response.setCohabitantComposition(mapCohabitantCompositionEmbeddableToResponse(application.getCohabitantComposition()));
        }
        if (application.getCohabitantDetails() != null) {
            response.setCohabitantDetails(
                application.getCohabitantDetails().stream()
                           .map(AdoptionService::mapCohabitantDetailEmbeddableToResponse)
                           .collect(Collectors.toList())
            );
        }
        response.setCohabitantAllergy(application.getCohabitantAllergy());

        // Current Pets
        response.setHasCurrentPets(application.getHasCurrentPets());
        if (application.getCurrentPetDetails() != null) {
            response.setCurrentPetDetails(
                application.getCurrentPetDetails().stream()
                           .map(AdoptionService::mapCurrentPetDetailEmbeddableToResponse)
                           .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        response.setHasPastPetExperience(application.getHasPastPetExperience());
        if (application.getPastPetExperiences() != null) {
            response.setPastPetExperiences(
                application.getPastPetExperiences().stream()
                           .map(AdoptionService::mapPastPetExperienceEmbeddableToResponse)
                           .collect(Collectors.toList())
            );
        }

        // Residency Information
        response.setResidenceType(application.getResidenceType());
        response.setIsOwner(application.getIsOwner());

        // Education
        response.setCompletedOwnerEducation(application.getCompletedOwnerEducation());

        // Commitment Agreement
        response.setAgreesToLifetimeCommitment(application.getAgreesToLifetimeCommitment());
        response.setAgreesToFollowUp(application.getAgreesToFollowUp());

        // Work Information
        response.setJob(application.getJob());
        response.setWorkingHours(application.getWorkingHours());
        response.setAloneTimeManagement(application.getAloneTimeManagement());

        // Marital Status
        response.setMaritalStatus(application.getMaritalStatus());

        // Pet Living Space
        response.setPetLivingSpaceLocation(application.getPetLivingSpaceLocation());
        response.setPetLivingSpacePhotoUrl(application.getPetLivingSpacePhotoUrl());

        // Financial & Health Agreement
        response.setMonthlyExpenseRange(application.getMonthlyExpenseRange());
        response.setAgreesToNeutering(application.getAgreesToNeutering());

        // Essays
        response.setMotivationForAdoption(application.getMotivationForAdoption());
        response.setLifeChangeCopingPlan(application.getLifeChangeCopingPlan());
        response.setTravelCopingPlan(application.getTravelCopingPlan());
        response.setAgreesToRegularUpdates(application.getAgreesToRegularUpdates());
        response.setAdditionalQuestions(application.getAdditionalQuestions());

        return response;
    }

    private static EmergencyContactInfo mapEmergencyContactRequestToEmbeddable(EmergencyContactRequest request) {
        EmergencyContactInfo embeddable = new EmergencyContactInfo();
        embeddable.setContactName(request.getContactName());
        embeddable.setContactPhoneNumber(request.getContactPhoneNumber());
        embeddable.setRelationship(request.getRelationship());
        return embeddable;
    }

    private static EmergencyContactResponse mapEmergencyContactEmbeddableToResponse(EmergencyContactInfo embeddable) {
        EmergencyContactResponse response = new EmergencyContactResponse();
        response.setContactName(embeddable.getContactName());
        response.setContactPhoneNumber(embeddable.getContactPhoneNumber());
        response.setRelationship(embeddable.getRelationship());
        return response;
    }

    private static CohabitantComposition mapCohabitantCompositionRequestToEmbeddable(CohabitantCompositionRequest request) {
        CohabitantComposition embeddable = new CohabitantComposition();
        embeddable.setNumberOfAdults(request.getNumberOfAdults());
        embeddable.setNumberOfChildren(request.getNumberOfChildren());
        return embeddable;
    }

    private static CohabitantCompositionResponse mapCohabitantCompositionEmbeddableToResponse(CohabitantComposition embeddable) {
        CohabitantCompositionResponse response = new CohabitantCompositionResponse();
        response.setNumberOfAdults(embeddable.getNumberOfAdults());
        response.setNumberOfChildren(embeddable.getNumberOfChildren());
        return response;
    }

    private static CohabitantDetail mapCohabitantDetailRequestToEmbeddable(CohabitantDetailRequest request) {
        CohabitantDetail embeddable = new CohabitantDetail();
        embeddable.setRelationship(request.getRelationship());
        embeddable.setAge(request.getAge());
        embeddable.setHasAllergy(request.getHasAllergy());
        return embeddable;
    }

    private static CohabitantDetailResponse mapCohabitantDetailEmbeddableToResponse(CohabitantDetail embeddable) {
        CohabitantDetailResponse response = new CohabitantDetailResponse();
        response.setRelationship(embeddable.getRelationship());
        response.setAge(embeddable.getAge());
        response.setHasAllergy(embeddable.getHasAllergy());
        return response;
    }

    private static CurrentPetDetail mapCurrentPetDetailRequestToEmbeddable(CurrentPetDetailRequest request) {
        CurrentPetDetail embeddable = new CurrentPetDetail();
        embeddable.setPetType(request.getPetType());
        embeddable.setBreed(request.getBreed());
        embeddable.setCount(request.getCount());
        embeddable.setAge(request.getAge());
        embeddable.setNeutered(request.getNeutered());
        embeddable.setReasonForAdoptingMore(request.getReasonForAdoptingMore());
        return embeddable;
    }

    private static CurrentPetDetailResponse mapCurrentPetDetailEmbeddableToResponse(CurrentPetDetail embeddable) {
        CurrentPetDetailResponse response = new CurrentPetDetailResponse();
        response.setPetType(embeddable.getPetType());
        response.setBreed(embeddable.getBreed());
        response.setCount(embeddable.getCount());
        response.setAge(embeddable.getAge());
        response.setNeutered(embeddable.getNeutered());
        response.setReasonForAdoptingMore(embeddable.getReasonForAdoptingMore());
        return response;
    }

    private static PastPetExperience mapPastPetExperienceRequestToEmbeddable(PastPetExperienceRequest request) {
        PastPetExperience embeddable = new PastPetExperience();
        embeddable.setPastPetType(request.getPastPetType());
        embeddable.setPastPetCount(request.getPastPetCount());
        embeddable.setDuration(request.getDuration());
        embeddable.setIsCurrentlyWithYou(request.getIsCurrentlyWithYou());
        embeddable.setDetails(request.getDetails());
        return embeddable;
    }

    private static PastPetExperienceResponse mapPastPetExperienceEmbeddableToResponse(PastPetExperience embeddable) {
        PastPetExperienceResponse response = new PastPetExperienceResponse();
        response.setPastPetType(embeddable.getPastPetType());
        response.setPastPetCount(embeddable.getPastPetCount());
        response.setDuration(embeddable.getDuration());
        response.setIsCurrentlyWithYou(embeddable.getIsCurrentlyWithYou());
        response.setDetails(embeddable.getDetails());
        return response;
    }
}