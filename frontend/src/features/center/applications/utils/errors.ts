import { ApiError } from "@/shared/api/client";

export function resolveApiErrorMessage(err: unknown, fallback = "요청에 실패했습니다.") {
  if (err instanceof ApiError) {
    if (err.status === 401) return "보호소 계정으로 로그인해 주세요.";
    if (err.status === 403) return "보호소 권한이 없습니다.";
    if (err.status === 404) return "대상을 찾을 수 없습니다.";
    if (err.status === 409) return "이미 처리된 항목입니다. 최신 상태를 확인해 주세요.";
    if (err.status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}
