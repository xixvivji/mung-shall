package com.example.backend.domain.shelter;

import com.example.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter // update api를 만들긴 햇음. but 현재는 공공데이터 api가져오므로 애너테이션 지우고 메서드 없애도됨
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
public class Shelter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User owner;


    @Column(nullable = false)
    private String careNm; // 보호소 이름

    @Column(name = "shelter_reg_no", length = 20)
    private String shelterRegNo; // 보호소 등록번호

    private String tel;
    private String address;
}
