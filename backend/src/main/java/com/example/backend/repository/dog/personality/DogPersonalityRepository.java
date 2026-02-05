package com.example.backend.repository.dog.personality;

import com.example.backend.domain.dog.personality.DogPersonality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DogPersonalityRepository extends JpaRepository<DogPersonality, Long> {

    Optional<DogPersonality> findByAbandonedDog_Id(Long abandonedDogId);

    boolean existsByAbandonedDog_Id(Long abandonedDogId);

    /**
     * 백필이 필요한 DogPersonality
     * - JPQL에서 trim() 같은 함수는 환경/드라이버에 따라 이슈가 생길 수 있어 가장 안전한 조건으로 시작
     * - 공백만 있는 값(whitespace-only)은 Processor에서 hasText로 처리
     */
    @Query("""
            select p
            from DogPersonality p
            where p.augmentedText is null
               or p.augmentedText = ''
        """)
    List<DogPersonality> findNeedBackfill();


}
