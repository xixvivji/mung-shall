package com.example.backend.domain.dog;

public enum DogAdoptionStatus {
    NOT_ADOPTED,      // 아무도 입양 진행/완료 X
    ADOPTING_BY_ME,   // 내가 입양 진행 중
    ADOPTING_BY_OTHERS, // 다른 사람이 입양 진행 중
    ADOPTED           // 입양 완료
}
