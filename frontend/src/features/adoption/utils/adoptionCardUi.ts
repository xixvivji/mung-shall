import type { AdoptionStatus, UserType } from "../types";

type AuthUserLike = {
  userType?: unknown;
  type?: unknown;
} | null | undefined;

export function resolveAdoptionTagLabel(
  adoptionStatus: AdoptionStatus,
  userType: UserType
): string {
  if (userType === "GUEST") {
    if (
      adoptionStatus === "ADOPTING_BY_ME" ||
      adoptionStatus === "ADOPTING_BY_OTHERS"
    ) {
      return "입양 진행중";
    }
  }

  const map: Record<AdoptionStatus, string> = {
    NOT_ADOPTED: "입양 가능",
    ADOPTING_BY_ME: "입양 진행중",
    ADOPTING_BY_OTHERS: "다른 입양자 진행중",
    ADOPTED: "입양 완료",
  };

  return map[adoptionStatus];
}

export function resolveUserType(user: AuthUserLike): UserType {
  if (!user) {
    return "GUEST";
  }

  const raw = String(user.userType ?? user.type ?? "")
    .trim()
    .toUpperCase();

  if (raw === "SHELTER") {
    return "SHELTER";
  }

  if (raw === "GUEST") {
    return "GUEST";
  }

  if (raw === "GENERAL") {
    return "GENERAL";
  }

  return "GENERAL";
}

export function shouldShowHeartButton(
  adoptionStatus: AdoptionStatus,
  userType: UserType
): boolean {
  return userType === "GENERAL" && adoptionStatus === "NOT_ADOPTED";
}

export function resolveAdoptionStatus(options: {
  adoptionStatus?: unknown;
  adopting?: boolean;
  processState?: string;
}): AdoptionStatus {
  const status = String(options.adoptionStatus ?? "")
    .trim()
    .toUpperCase();

  if (
    status === "NOT_ADOPTED" ||
    status === "ADOPTING_BY_ME" ||
    status === "ADOPTING_BY_OTHERS" ||
    status === "ADOPTED"
  ) {
    return status;
  }

  const processState = String(options.processState ?? "")
    .trim()
    .toUpperCase();

  if (processState === "ADOPTED" || processState === "입양완료" || processState === "종료") {
    return "ADOPTED";
  }

  if (options.adopting) {
    return "ADOPTING_BY_OTHERS";
  }

  return "NOT_ADOPTED";
}

export function resolveAdoptionTagColorClass(label: string): string {
  const map: Record<string, string> = {
    "입양 가능": "bg-emerald-500 text-white",
    "입양 진행중": "bg-blue-500 text-white",
    "다른 입양자 진행중": "bg-orange-500 text-white",
    "입양 완료": "bg-gray-500 text-white",
  };

  return map[label] ?? "bg-gray-500 text-white";
}
