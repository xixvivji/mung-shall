package com.example.backend.service.adoption.survey;

import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest.CohabitantCompositionRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest.CohabitantDetailRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest.CurrentPetDetailRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest.EmergencyContactRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyRequest.PastPetExperienceRequest;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse.CohabitantCompositionResponse;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse.CohabitantDetailResponse;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse.CurrentPetDetailResponse;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse.EmergencyContactResponse;
import com.example.backend.api.adoption.dto.survey.AdoptionSurveyResponse.PastPetExperienceResponse;
import com.example.backend.domain.adoption.Adoption;
import com.example.backend.domain.adoption.AdoptionStepInstance;
import com.example.backend.domain.adoption.enums.AdoptionProcessStatus;
import com.example.backend.domain.adoption.enums.AdoptionStepStatus;
import com.example.backend.domain.adoption.embed.CohabitantComposition;
import com.example.backend.domain.adoption.embed.CohabitantDetail;
import com.example.backend.domain.adoption.embed.CurrentPetDetail;
import com.example.backend.domain.adoption.embed.EmergencyContactInfo;
import com.example.backend.domain.adoption.embed.PastPetExperience;
import com.example.backend.domain.adoption.step.survey.AdoptionSurvey;
import com.example.backend.repository.adoption.survey.AdoptionSurveyRepository;
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
public class AdoptionSurveyService {

    private final AdoptionRepository adoptionRepository;
    private final AdoptionStepInstanceRepository adoptionStepInstanceRepository;
    private final AdoptionSurveyRepository adoptionSurveyRepository;

    /**
     * 입양사전 설문 상세 정보를 제출하거나 수정합니다.
     * 첫 번째 단계인 '입양사전 설문 제출' 단계에서 호출됩니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @param request    입양사전 설문 요청 DTO
     * @return 저장되거나 업데이트된 AdoptionSurvey의 응답 DTO
     */
    public AdoptionSurveyResponse submitAdoptionSurvey(Long adoptionId, AdoptionSurveyRequest request) {
        Adoption adoption = adoptionRepository.findById(adoptionId)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 입양을 찾을 수 없습니다: " + adoptionId));

        // 해당 입양의 1단계(입양사전 설문 제출) 인스턴스 찾기
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양사전 설문 제출 단계를 찾을 수 없습니다."));

        // 1단계(입양사전 설문 제출)이 가능 상태인지 확인
        boolean canSubmitStep =
                applicationStep.getStatus() == AdoptionStepStatus.PENDING ||
                        applicationStep.getStatus() == AdoptionStepStatus.SUBMITTED ||
                        applicationStep.getStatus() == AdoptionStepStatus.REJECTED;

        boolean isProcessActive =
                adoption.getProcessStatus() == AdoptionProcessStatus.IN_PROGRESS;

        if (!canSubmitStep || !isProcessActive) {
            throw new IllegalStateException("입양사전 설문을 제출할 수 있는 상태가 아닙니다");
        }

        AdoptionSurvey survey = adoptionSurveyRepository.findByStepInstanceId(applicationStep.getId())
                .orElse(new AdoptionSurvey()); // 없으면 새로 생성

        // Request DTO -> Entity 매핑
        mapRequestToAdoptionSurvey(request, survey);
        survey.setStepInstance(applicationStep);

        adoptionSurveyRepository.save(survey);

        // 단계 상태 업데이트
        applicationStep.setStatus(AdoptionStepStatus.SUBMITTED);
        applicationStep.setSubmittedAt(LocalDateTime.now());
        return mapAdoptionSurveyToResponse(survey);
    }

    /**
     * 특정 입양 프로세스의 입양사전 설문 상세 정보를 조회합니다.
     *
     * @param adoptionId 입양 프로세스 ID
     * @return 입양사전 설문 응답 DTO
     */
    @Transactional(readOnly = true)
    public AdoptionSurveyResponse getAdoptionSurvey(Long adoptionId) {
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양사전 설문 제출 단계를 찾을 수 없습니다."));

        AdoptionSurvey survey = adoptionSurveyRepository.findByStepInstanceId(applicationStep.getId())
                .orElseThrow(() -> new IllegalArgumentException("입양사전 설문이 존재하지 않습니다."));

        return mapAdoptionSurveyToResponse(survey);
    }

    /**
     * 제출된 입양사전 설문을 삭제하고 단계를 초기 상태로 되돌립니다.
     *
     * @param adoptionId 입양 프로세스 ID
     */
    public void deleteAdoptionSurvey(Long adoptionId) {
        AdoptionStepInstance applicationStep = adoptionStepInstanceRepository
                .findByAdoptionIdAndStepDefStepOrder(adoptionId, 1)
                .orElseThrow(() -> new IllegalArgumentException("입양사전 설문 제출 단계를 찾을 수 없습니다."));

        // 제출된 상태가 아니면 삭제할 필요 없음
        if (applicationStep.getStatus() == AdoptionStepStatus.PENDING || applicationStep.getStatus() == AdoptionStepStatus.NOT_STARTED) {
            return; // 이미 비어있는 상태이므로 아무것도 하지 않음, 상태 코드로 알려주기??
        }

        // 관리자에 의해 완료된 상태라면 사용자가 임의로 삭제할 수 없음
        if (applicationStep.getStatus() == AdoptionStepStatus.COMPLETED) {
            throw new IllegalStateException("이미 승인 완료된 설문은 삭제할 수 없습니다.");
        }

        AdoptionSurvey survey = adoptionSurveyRepository.findByStepInstanceId(applicationStep.getId())
                .orElse(null);

        if (survey != null) {
            adoptionSurveyRepository.delete(survey);
        }

        // 단계 상태를 리셋
        applicationStep.setStatus(AdoptionStepStatus.PENDING);
        applicationStep.setSubmittedAt(null);
        applicationStep.setRejectionReason(null);
        adoptionStepInstanceRepository.save(applicationStep);
    }

    // --- Mapper methods ---

    private void mapRequestToAdoptionSurvey(AdoptionSurveyRequest request, AdoptionSurvey survey) {
        // Personal Information
        survey.setName(request.getName());
        survey.setDateOfBirth(request.getDateOfBirth());
        survey.setGender(request.getGender());
        survey.setPhoneNumber(request.getPhoneNumber());
        survey.setEmail(request.getEmail());

        // Address
        survey.setAddress(request.getAddress());
        survey.setDetailAddress(request.getDetailAddress());

        // Family Contacts
        if (request.getEmergencyContacts() != null) {
            survey.getEmergencyContacts().clear();
            survey.getEmergencyContacts().addAll(
                    request.getEmergencyContacts().stream()
                            .map(AdoptionSurveyService::mapEmergencyContactRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }

        // Pet Preference
        survey.setPetPreference(request.getPetPreference());

        // Cohabitant Information
        survey.setCohabitantAgreement(request.getCohabitantAgreement());
        survey.setHasCohabitant(request.getHasCohabitant());
        if (request.getCohabitantComposition() != null) {
            survey.setCohabitantComposition(mapCohabitantCompositionRequestToEmbeddable(request.getCohabitantComposition()));
        }
        if (request.getCohabitantDetails() != null) {
            survey.getCohabitantDetails().clear();
            survey.getCohabitantDetails().addAll(
                    request.getCohabitantDetails().stream()
                            .map(AdoptionSurveyService::mapCohabitantDetailRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }


        // Current Pets
        survey.setHasCurrentPets(request.getHasCurrentPets());
        if (request.getCurrentPetDetails() != null) {
            survey.getCurrentPetDetails().clear();
            survey.getCurrentPetDetails().addAll(
                    request.getCurrentPetDetails().stream()
                            .map(AdoptionSurveyService::mapCurrentPetDetailRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        survey.setHasPastPetExperience(request.getHasPastPetExperience());
        if (request.getPastPetExperiences() != null) {
            survey.getPastPetExperiences().clear();
            survey.getPastPetExperiences().addAll(
                    request.getPastPetExperiences().stream()
                            .map(AdoptionSurveyService::mapPastPetExperienceRequestToEmbeddable)
                            .collect(Collectors.toList())
            );
        }

        // Residency Information
        survey.setResidenceType(request.getResidenceType());
        survey.setIsOwner(request.getIsOwner());

        // Education
        survey.setCompletedOwnerEducation(request.getCompletedOwnerEducation());

        // Commitment Agreement
        survey.setAgreesToLifetimeCommitment(request.getAgreesToLifetimeCommitment());
        survey.setAgreesToFollowUp(request.getAgreesToFollowUp());

        // Work Information
        survey.setJob(request.getJob());
        survey.setWorkingHours(request.getWorkingHours());
        survey.setAloneTimeManagement(request.getAloneTimeManagement());

        // Marital Status
        survey.setMaritalStatus(request.getMaritalStatus());

        // Pet Living Space
        survey.setPetLivingSpaceLocation(request.getPetLivingSpaceLocation());
        survey.setPetLivingSpacePhotoUrl(request.getPetLivingSpacePhotoUrl());

        // Financial & Health Agreement
        survey.setMonthlyExpenseRange(request.getMonthlyExpenseRange());
        survey.setAgreesToNeutering(request.getAgreesToNeutering());

        // Essays
        survey.setMotivationForAdoption(request.getMotivationForAdoption());
        survey.setLifeChangeCopingPlan(request.getLifeChangeCopingPlan());
        survey.setTravelCopingPlan(request.getTravelCopingPlan());
        survey.setAgreesToRegularUpdates(request.getAgreesToRegularUpdates());
        survey.setAdditionalQuestions(request.getAdditionalQuestions());
    }

    private AdoptionSurveyResponse mapAdoptionSurveyToResponse(AdoptionSurvey survey) {
        AdoptionSurveyResponse response = new AdoptionSurveyResponse();
        response.setId(survey.getId());
        response.setStepInstanceId(survey.getStepInstance().getId());

        // Personal Information
        response.setName(survey.getName());
        response.setDateOfBirth(survey.getDateOfBirth());
        response.setGender(survey.getGender());
        response.setPhoneNumber(survey.getPhoneNumber());
        response.setEmail(survey.getEmail());

        // Address
        response.setAddress(survey.getAddress());
        response.setDetailAddress(survey.getDetailAddress());

        // Family Contacts
        if (survey.getEmergencyContacts() != null) {
            response.setEmergencyContacts(
                    survey.getEmergencyContacts().stream()
                            .map(AdoptionSurveyService::mapEmergencyContactEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }

        // Pet Preference
        response.setPetPreference(survey.getPetPreference());

        // Cohabitant Information
        response.setCohabitantAgreement(survey.getCohabitantAgreement());
        response.setHasCohabitant(survey.getHasCohabitant());
        if (survey.getCohabitantComposition() != null) {
            response.setCohabitantComposition(mapCohabitantCompositionEmbeddableToResponse(survey.getCohabitantComposition()));
        }
        if (survey.getCohabitantDetails() != null) {
            response.setCohabitantDetails(
                    survey.getCohabitantDetails().stream()
                            .map(AdoptionSurveyService::mapCohabitantDetailEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }


        // Current Pets
        response.setHasCurrentPets(survey.getHasCurrentPets());
        if (survey.getCurrentPetDetails() != null) {
            response.setCurrentPetDetails(
                    survey.getCurrentPetDetails().stream()
                            .map(AdoptionSurveyService::mapCurrentPetDetailEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }

        // Past Pet Experience
        response.setHasPastPetExperience(survey.getHasPastPetExperience());
        if (survey.getPastPetExperiences() != null) {
            response.setPastPetExperiences(
                    survey.getPastPetExperiences().stream()
                            .map(AdoptionSurveyService::mapPastPetExperienceEmbeddableToResponse)
                            .collect(Collectors.toList())
            );
        }

        // Residency Information
        response.setResidenceType(survey.getResidenceType());
        response.setIsOwner(survey.getIsOwner());

        // Education
        response.setCompletedOwnerEducation(survey.getCompletedOwnerEducation());

        // Commitment Agreement
        response.setAgreesToLifetimeCommitment(survey.getAgreesToLifetimeCommitment());
        response.setAgreesToFollowUp(survey.getAgreesToFollowUp());

        // Work Information
        response.setJob(survey.getJob());
        response.setWorkingHours(survey.getWorkingHours());
        response.setAloneTimeManagement(survey.getAloneTimeManagement());

        // Marital Status
        response.setMaritalStatus(survey.getMaritalStatus());

        // Pet Living Space
        response.setPetLivingSpaceLocation(survey.getPetLivingSpaceLocation());
        response.setPetLivingSpacePhotoUrl(survey.getPetLivingSpacePhotoUrl());

        // Financial & Health Agreement
        response.setMonthlyExpenseRange(survey.getMonthlyExpenseRange());
        response.setAgreesToNeutering(survey.getAgreesToNeutering());

        // Essays
        response.setMotivationForAdoption(survey.getMotivationForAdoption());
        response.setLifeChangeCopingPlan(survey.getLifeChangeCopingPlan());
        response.setTravelCopingPlan(survey.getTravelCopingPlan());
        response.setAgreesToRegularUpdates(survey.getAgreesToRegularUpdates());
        response.setAdditionalQuestions(survey.getAdditionalQuestions());

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
