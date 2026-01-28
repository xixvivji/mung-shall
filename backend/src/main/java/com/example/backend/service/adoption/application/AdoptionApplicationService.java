package com.example.backend.service.adoption.application;

import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest.CohabitantCompositionRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest.CohabitantDetailRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest.CurrentPetDetailRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest.EmergencyContactRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationRequest.PastPetExperienceRequest;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse.CohabitantCompositionResponse;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse.CohabitantDetailResponse;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse.CurrentPetDetailResponse;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse.EmergencyContactResponse;
import com.example.backend.api.adoption.dto.application.AdoptionApplicationResponse.PastPetExperienceResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.embed.CohabitantComposition;
import com.example.backend.domain.adoption.embed.CohabitantDetail;
import com.example.backend.domain.adoption.embed.CurrentPetDetail;
import com.example.backend.domain.adoption.embed.EmergencyContactInfo;
import com.example.backend.domain.adoption.embed.PastPetExperience;
import com.example.backend.domain.adoption.step.application.AdoptionApplication;
import com.example.backend.repository.adoption.application.AdoptionApplicationRepository;
import com.example.backend.repository.adoption.AdoptionRepository;
import com.example.backend.repository.adoption.AdoptionStepInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdoptionApplicationService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionApplicationRepository adoptionApplicationRepository;

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
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 입양을 찾을 수 없습니다: " + adoptionId));

        // 해당 입양의 1단계(입양 신청서 제출) 인스턴스 찾기
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서 제출 단계를 찾을 수 없습니다."));

        // 1단계(입양 신청서 제출)이 가능 상태인지 확인
        if (applicationStep.getStatus() != AdoptionStepStatus.PENDING && // 제출 대기
                applicationStep.getStatus() != AdoptionStepStatus.SUBMITTED && // 제출시 수정 가능
                applicationStep.getStatus() != AdoptionStepStatus.REJECTED && // 반려되었을 경우 재제출 가능
                adoption.getProcessStatus() == AdoptionProcessStatus.IN_PROGRESS
        ) {
            throw new IllegalStateException("입양 신청서를 제출할 수 있는 상태가 아닙니다");
        }

        AdoptionApplication application = adoptionApplicationRepository.findByStepInstanceId(applicationStep.getId())
                .orElse(new AdoptionApplication()); // 없으면 새로 생성

        // Request DTO -> Entity 매핑
        mapRequestToAdoptionApplication(request, application);
        application.setStepInstance(applicationStep);

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
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서 제출 단계를 찾을 수 없습니다."));

        AdoptionApplication application = adoptionApplicationRepository.findByStepInstanceId(applicationStep.getId())
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서가 존재하지 않습니다."));

        return mapAdoptionApplicationToResponse(application);
    }

    /**
     * 제출된 입양 신청서를 삭제하고 단계를 초기 상태로 되돌립니다.
     *
     * @param adoptionId 입양 프로세스 ID
     */
    public void deleteAdoptionApplication(Long adoptionId) {
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양 신청서 제출 단계를 찾을 수 없습니다."));

        // 제출된 상태가 아니면 삭제할 필요 없음
        if (applicationStep.getStatus() == AdoptionStepStatus.PENDING || applicationStep.getStatus() == AdoptionStepStatus.NOT_STARTED) {
            return; // 이미 비어있는 상태이므로 아무것도 하지 않음
        }

        // 관리자에 의해 완료된 상태라면 사용자가 임의로 삭제할 수 없음
        if (applicationStep.getStatus() == AdoptionStepStatus.COMPLETED) {
            throw new IllegalStateException("이미 승인 완료된 신청서는 삭제할 수 없습니다.");
        }

        AdoptionApplication application = adoptionApplicationRepository.findByStepInstanceId(applicationStep.getId())
                .orElse(null);

        if (application != null) {
            adoptionApplicationRepository.delete(application);
        }

        // 단계 상태를 리셋
        applicationStep.setStatus(AdoptionStepStatus.PENDING);
        applicationStep.setSubmittedAt(null);
        applicationStep.setRejectionReason(null);
        adoptionStepInstanceRepository.save(applicationStep);
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
                            .map(AdoptionApplicationService::mapEmergencyContactRequestToEmbeddable)
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
                            .map(AdoptionApplicationService::mapCohabitantDetailRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }


        // Current Pets
        application.setHasCurrentPets(request.getHasCurrentPets());
        if (request.getCurrentPetDetails() != null) {
            application.getCurrentPetDetails().clear();
            application.getCurrentPetDetails().addAll(
                    request.getCurrentPetDetails().stream()
                            .map(AdoptionApplicationService::mapCurrentPetDetailRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        application.setHasPastPetExperience(request.getHasPastPetExperience());
        if (request.getPastPetExperiences() != null) {
            application.getPastPetExperiences().clear();
            application.getPastPetExperiences().addAll(
                    request.getPastPetExperiences().stream()
                            .map(AdoptionApplicationService::mapPastPetExperienceRequestToEmbeddable)
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
                            .map(AdoptionApplicationService::mapEmergencyContactEmbeddableToResponse)
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
                            .map(AdoptionApplicationService::mapCohabitantDetailEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }


        // Current Pets
        response.setHasCurrentPets(application.getHasCurrentPets());
        if (application.getCurrentPetDetails() != null) {
            response.setCurrentPetDetails(
                    application.getCurrentPetDetails().stream()
                            .map(AdoptionApplicationService::mapCurrentPetDetailEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        response.setHasPastPetExperience(application.getHasPastPetExperience());
        if (application.getPastPetExperiences() != null) {
            response.setPastPetExperiences(
                    application.getPastPetExperiences().stream()
                            .map(AdoptionApplicationService::mapPastPetExperienceEmbeddableToResponse)
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
        embeddable.setAdoptionAgreement(request.getAdoptionAgreement());
        return embeddable;
    }

    private static CohabitantDetailResponse mapCohabitantDetailEmbeddableToResponse(CohabitantDetail embeddable) {
        CohabitantDetailResponse response = new CohabitantDetailResponse();
        response.setRelationship(embeddable.getRelationship());
        response.setAge(embeddable.getAge());
        response.setHasAllergy(embeddable.getHasAllergy());
        response.setAdoptionAgreement(embeddable.getAdoptionAgreement());
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
