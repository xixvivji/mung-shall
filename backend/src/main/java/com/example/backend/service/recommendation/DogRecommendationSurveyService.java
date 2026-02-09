package com.example.backend.service.recommendation;

import com.example.backend.api.recommendation.dto.DogRecommendationSurveyCreateRequest;
import com.example.backend.api.recommendation.dto.DogRecommendationSurveyResponse;
import com.example.backend.api.recommendation.dto.DogRecommendationSurveyUpdateRequest;
import com.example.backend.domain.recommendation.DogRecommendationSurvey;
import com.example.backend.domain.user.User;
import com.example.backend.repository.recommendation.DogRecommendationSurveyRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DogRecommendationSurveyService {

    private final DogRecommendationSurveyRepository dogRecommendationSurveyRepository;
    private final UserRepository userRepository;

    @Transactional
    public DogRecommendationSurveyResponse createSurvey(DogRecommendationSurveyCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.getUserId()));

        if (dogRecommendationSurveyRepository.findByUserUserId(request.getUserId()).isPresent()) {
            throw new IllegalStateException("User already submitted a dog recommendation survey.");
        }

        DogRecommendationSurvey survey = new DogRecommendationSurvey(
                user,
                request.getRestActivityLevel(),
                request.getResidenceType(),
                request.getHouseEmptyTime(),
                request.getFurTolerance(),
                request.getVisitorFrequency()
        );
        DogRecommendationSurvey savedSurvey = dogRecommendationSurveyRepository.save(survey);
        return DogRecommendationSurveyResponse.fromEntity(savedSurvey);
    }

    public DogRecommendationSurveyResponse getSurveyByUserId(Long userId) {
        DogRecommendationSurvey survey = dogRecommendationSurveyRepository.findByUserUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Dog recommendation survey not found for User ID: " + userId));
        return DogRecommendationSurveyResponse.fromEntity(survey);
    }

    @Transactional
    public DogRecommendationSurveyResponse updateSurvey(Long userId, DogRecommendationSurveyUpdateRequest request) {
        DogRecommendationSurvey survey = dogRecommendationSurveyRepository.findByUserUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Dog recommendation survey not found for User ID: " + userId));

        survey.update(
                request.getRestActivityLevel(),
                request.getResidenceType(),
                request.getHouseEmptyTime(),
                request.getFurTolerance(),
                request.getVisitorFrequency()
        );
        DogRecommendationSurvey updatedSurvey = dogRecommendationSurveyRepository.save(survey); // save might not be strictly necessary due to transactional context, but good practice
        return DogRecommendationSurveyResponse.fromEntity(updatedSurvey);
    }

    @Transactional
    public void deleteSurveyByUserId(Long userId) {
        DogRecommendationSurvey survey = dogRecommendationSurveyRepository.findByUserUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Dog recommendation survey not found for User ID: " + userId));
        dogRecommendationSurveyRepository.delete(survey);
    }
}
