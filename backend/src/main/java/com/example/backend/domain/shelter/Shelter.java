package com.example.backend.domain.shelter;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Shelter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 계정 지정 안되어있으면 admin 계정으로 임시 귀속
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // unique = true)
    private User user;

    @Column(nullable = false)
    private String careNm; // 보호소 이름

    @Column(name = "shelter_reg_no", length = 20)
    private String shelterRegNo; // 보호소 등록번호

    public Shelter(User user, String careNm) {
        this.user = user;
        this.careNm = careNm;
        this.shelterRegNo = getShelterRegNo();
    }
}
