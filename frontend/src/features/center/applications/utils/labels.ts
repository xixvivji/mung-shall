import type { AdoptionProcessStatus, AdoptionFinalStatus } from "../../api/centerApplicationsApi";

export const STEP_NAME_BY_ORDER: Record<number, string> = {
  1: "입양 사전 설문 제출",
  2: "교육 수료증 제출",
  3: "입양 문서 제출",
  4: "입양 상담 진행",
  5: "입양 계약서 업로드",
};

export function stepNameByOrder(order: number) {
  return STEP_NAME_BY_ORDER[order] ?? `단계 ${order}`;
}

export const STATUS_FILTERS: Array<{ value: AdoptionProcessStatus; label: string }> = [
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

export const PROCESS_STATUS_LABELS: Record<AdoptionProcessStatus, string> = {
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

export function processBadgeVariant(status: AdoptionProcessStatus) {
  if (status === "COMPLETED") return "default";
  if (status === "CANCELLED") return "destructive";
  return "secondary";
}

export function finalStatusLabel(status?: AdoptionFinalStatus | null) {
  if (!status) return "-";
  const s = String(status).toUpperCase();
  if (s === "APPROVED") return "최종 승인";
  if (s === "REJECTED") return "최종 반려";
  if (s === "WAITING" || s === "PENDING") return "대기";
  return s;
}

export const STEP_STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "미시작",
  SUBMITTED: "제출됨",
  APPROVED: "승인",
  REJECTED: "반려",
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
};

export function stepBadgeVariant(status: string) {
  const s = String(status).toUpperCase();
  if (s === "APPROVED" || s === "COMPLETED") return "default";
  if (s === "REJECTED") return "destructive";
  if (s === "SUBMITTED" || s === "IN_PROGRESS") return "secondary";
  return "outline";
}

export function stepStatusLabel(status: unknown) {
  const key = String(status ?? "").toUpperCase();
  return (STEP_STATUS_LABEL[key] ?? key) || "-";
}
