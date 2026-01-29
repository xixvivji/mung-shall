package com.example.backend.repository.dog;

import com.example.backend.domain.dog.AbandonedDog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbandonedDogRepository extends JpaRepository<AbandonedDog, Long>, JpaSpecificationExecutor<AbandonedDog> {

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

    /**
     * 발견 장소(happenPlace)에 특정 지역명이 포함된 유기견 목록을 페이지네이션으로 조회합니다.
     * @param region 검색할 지역명 (e.g., "경기도", "수원시")
     * @param pageable 페이지 요청 정보
     * @return Page<AbandonedDog>
     */
    Page<AbandonedDog> findByHappenPlaceContaining(String region, Pageable pageable);

    List<AbandonedDog> findByCareRegNo(String careRegNo);

    // 특정 보호소에 속한 모든 강아지를 조회합니다.
    List<AbandonedDog> findByShelter_Id(Long shelterId);

    // 특정 보호소에 속한 강아지 중 특정 상태를 가진 강아지를 조회합니다.
    List<AbandonedDog> findByShelter_IdAndProcessState(Long shelterId, String processState);
}
