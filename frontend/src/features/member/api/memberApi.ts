import type { MemberMeResponse, MemberUpdateRequest } from "../types";
import { api } from "@/shared/api/client";

export async function fetchMyInfo(): Promise<MemberMeResponse> {
  return api<MemberMeResponse>("/members/me");
}

export async function updateMyInfo(
    payload: MemberUpdateRequest
): Promise<{ message: string }> {
  return api<{ message: string }>("/members/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
