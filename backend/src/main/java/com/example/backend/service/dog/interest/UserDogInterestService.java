package com.example.backend.service.dog.interest;

import com.example.backend.common.ApiException;
import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.interest.UserDogInterest;
import com.example.backend.domain.user.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.dog.AbandonedDogRepository;
import com.example.backend.repository.dog.interest.UserDogInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserDogInterestService {

    private final UserRepository userRepository;
    private final AbandonedDogRepository abandonedDogRepository;
    private final UserDogInterestRepository userDogInterestRepository;


    @Transactional
    public void likeDog(Long userId, Long dogId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        AbandonedDog abandonedDog = abandonedDogRepository.findById(dogId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Dog not found"));

        if (userDogInterestRepository.existsByUserAndAbandonedDog(user, abandonedDog)) {
            throw new ApiException(HttpStatus.CONFLICT, "Dog already liked by user");
        }

        UserDogInterest userDogInterest = UserDogInterest.builder()
                .user(user)
                .abandonedDog(abandonedDog)
                .build();

        userDogInterestRepository.save(userDogInterest);
    }

    @Transactional
    public void unlikeDog(Long userId, Long dogId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        AbandonedDog abandonedDog = abandonedDogRepository.findById(dogId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Dog not found"));

        UserDogInterest userDogInterest = userDogInterestRepository.findByUserAndAbandonedDog(user, abandonedDog)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Dog not liked by user"));

        userDogInterestRepository.delete(userDogInterest);
    }

    public List<AbandonedDog> getLikedDogs(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        List<UserDogInterest> interests = userDogInterestRepository.findAllByUser(user);
        return interests.stream()
                .map(UserDogInterest::getAbandonedDog)
                .collect(Collectors.toList());
    }
}