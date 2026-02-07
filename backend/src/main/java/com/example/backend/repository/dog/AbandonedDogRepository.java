package com.example.backend.repository.dog;

import com.example.backend.domain.dog.AbandonedDog;
import com.example.backend.domain.dog.personality.DogPersonality;
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
     * 데이터베이스에 존재하는 모든 유기번호 리스트 조회
     * @return List<String> 존재하는 유기번호 리스트
     */
    @Query("select a.desertionNo from AbandonedDog a")
    List<String> findAllDesertionNos();

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

    @Query("SELECT ad.processState, COUNT(ad) FROM AbandonedDog ad GROUP BY ad.processState")
    List<Object[]> countDogsByProcessState();

    /**
     * ✅ DogPersonality가 없는 유기견만 조회 (백필 생성 대상)
     * - JPQL join on 대신 NOT EXISTS로 안정성 확보
     */
    @Query("""
        select a
        from AbandonedDog a
        where not exists (
            select 1
            from DogPersonality p
            where p.abandonedDog = a
        )
        """)
    List<AbandonedDog> findWithoutPersonality();

    /**
     * ✅ 최신 유기견 id 목록 (prewarm 대상)
     * - "최신" 기준이 확정 전이면 PK(id) desc가 가장 안전
     */
    @Query("""
            select a.id
            from AbandonedDog a
            order by a.id desc
        """)
    Page<Long> findLatestDogIds(Pageable pageable);

    @Query(value = "SELECT * FROM abandoned_dog ORDER BY RAND() LIMIT :limit", nativeQuery = true)
    List<AbandonedDog> findRandomDogs(@Param("limit") int limit);
}
