package com.example.backend.domain.shelter;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Shelter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 계정 지정 안되어있으면 admin 계정으로 임시 귀속
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String careNm; // 보호소 이름

    @Column(name = "shelter_reg_no", length = 20)
    private String shelterRegNo; // 보호소 등록번호

    private String tel; // 보호소 전화번호
    private String address; // 보호소 주소
}
