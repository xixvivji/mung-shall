package com.example.backend.domain.postadoption.enums;

public enum PostAdoptionStepStatus {
    NOT_STARTED, // 시작 전
    PENDING,    // 대기 중 (사용자가 처리해야 할 단계)
    SUBMITTED,  // 제출됨 (사용자가 정보 제출 후 보호소 승인 대기)
    COMPLETED,  // 완료 (단계 성공적으로 완료)
    REJECTED,   // 반려됨 (보호소 검토 후 반려)
    CANCELLED   // 취소됨
}
