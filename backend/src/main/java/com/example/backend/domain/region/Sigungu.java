package com.example.backend.domain.region;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sigungu {

    @Id
    @Column(name = "org_cd")
    private String orgCd; // 기관 코드 (PK)

    @Column(name = "name", nullable = false)
    private String name; // 시군구 이름

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sido_org_cd")
    private Sido sido;

    public Sigungu(String orgCd, String name, Sido sido) {
        this.orgCd = orgCd;
        this.name = name;
        this.sido = sido;
    }
}
