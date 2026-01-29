import { api } from "@/shared/api/client";
import type {
  CenterProfile,
  CenterProfileUpdateRequest,
  MemberMeResponse,
} from "../profile/types";

export async function fetchMe(): Promise<MemberMeResponse> {
  return api<MemberMeResponse>("/members/me");
}

export async function fetchCenterProfile(_shelterId: number): Promise<CenterProfile> {
  return api<CenterProfile>("/shelter/profile");
}

export async function upsertCenterProfile(
  _shelterId: number,
  payload: CenterProfileUpdateRequest
): Promise<CenterProfile> {
  return api<CenterProfile>("/shelter/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
