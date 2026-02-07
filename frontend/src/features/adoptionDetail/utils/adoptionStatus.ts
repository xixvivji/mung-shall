import type { AdoptionStatus } from "@/features/adoption/types";

export function resolveAdoptionStatusLabel(
  adoptionStatus: AdoptionStatus
): string {
  const map: Record<AdoptionStatus, string> = {
    NOT_ADOPTED: "입양 가능",
    ADOPTING_BY_ME: "입양 진행중",
    ADOPTING_BY_OTHERS: "다른 입양자 진행중",
    ADOPTED: "입양 완료",
  };

  return map[adoptionStatus];
}

export function resolveAdoptionStatusFromServer(
  adoptionStatus: unknown
): AdoptionStatus {
  const normalized = String(adoptionStatus ?? "").trim().toUpperCase();

  if (
    normalized === "NOT_ADOPTED" ||
    normalized === "ADOPTING_BY_ME" ||
    normalized === "ADOPTING_BY_OTHERS" ||
    normalized === "ADOPTED"
  ) {
    return normalized;
  }

  return "NOT_ADOPTED";
}
