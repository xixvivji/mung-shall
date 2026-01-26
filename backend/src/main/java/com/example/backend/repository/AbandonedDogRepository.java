package com.example.backend.repository;

import com.example.backend.domain.dog.AbandonedDog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
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

    /**
     * 유기번호(desertionNo)로 유기견 정보의 존재 여부를 확인합니다.
     * findByDesertionNo보다 성능상 이점이 있습니다.
     * @param desertionNo 공공 API에서 제공하는 유기번호
     * @return boolean
     */
    boolean existsByDesertionNo(String desertionNo);

    /**
     * 주어진 유기번호 리스트에서 데이터베이스에 이미 존재하는 유기번호 리스트를 조회합니다.
     * @param desertionNos 조회할 유기번호 컬렉션
     * @return List<String> 존재하는 유기번호 리스트
     */
    @Query("SELECT a.desertionNo FROM AbandonedDog a WHERE a.desertionNo IN :desertionNos")
    List<String> findDesertionNosByDesertionNoIn(@Param("desertionNos") Collection<String> desertionNos);
}
