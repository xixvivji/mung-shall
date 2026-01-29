package com.example.backend.domain.region;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Sido {

    @Id
    @Column(name = "org_cd")
    private String orgCd; // 기관 코드 (PK)

    @Column(name = "name", nullable = false)
    private String name; // 시도 이름

    @OneToMany(mappedBy = "sido", cascade = CascadeType.ALL)
    private List<Sigungu> sigunguList = new ArrayList<>();

    public Sido(String orgCd, String name) {
        this.orgCd = orgCd;
        this.name = name;
    }
}
