package com.example.backend.repository;

import com.example.backend.domain.dog.AbandonedDog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AbandonedDogRepository extends JpaRepository<AbandonedDog, Long> {

    /**
     * 유기번호(desertionNo)로 유기견 정보를 조회합니다.
     * 데이터 동기화 시 중복 체크를 위해 사용됩니다.
     * @param desertionNo 공공 API에서 제공하는 유기번호
     * @return Optional<AbandonedDog>
     */
    Optional<AbandonedDog> findByDesertionNo(String desertionNo);
}
