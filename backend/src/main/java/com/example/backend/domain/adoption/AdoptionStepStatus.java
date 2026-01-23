package com.example.backend.domain.adoption;

public enum AdoptionStepStatus {
    NOT_STARTED, // 시작 전
    PENDING,    // 대기 중 (이전 단계 완료 대기)
    ACTIVE,     // 활성 (현재 사용자가 처리해야 할 단계)
    SUBMITTED,  // 제출됨 (사용자가 정보 제출 후 보호소 승인 대기)
    APPROVED,   // 승인됨 (보호소 검토 후 승인) - COMPLETED 직전의 임시 상태
    COMPLETED,  // 완료 (단계 성공적으로 완료)
    REJECTED,    // 반려됨 (보호소 검토 후 반려)
    CANCELLED // 취소됨
}
