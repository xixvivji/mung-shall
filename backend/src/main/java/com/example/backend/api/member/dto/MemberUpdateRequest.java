package com.example.backend.api.member.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberUpdateRequest {

    @Size(max = 100, message = "name은 100자 이하여야 합니다.")
    private String name;

    @Size(max = 30, message = "phone은 30자 이하여야 합니다.")
    private String phone;

    @Size(max = 255, message = "address는 255자 이하여야 합니다.")
    private String address;
}
