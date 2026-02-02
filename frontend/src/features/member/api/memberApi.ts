import type { MemberMeResponse } from "../types";
import { api } from "@/shared/api/client";

export async function fetchMyInfo(): Promise<MemberMeResponse> {
  return api<MemberMeResponse>("/members/me");
}
