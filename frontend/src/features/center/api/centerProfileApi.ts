import { api } from "@/shared/api/client";
import type { CenterProfile, CenterProfileUpdateRequest } from "../types";

export async function getCenterProfile(): Promise<CenterProfile> {
  return api<CenterProfile>("/shelter/profile");
}

export async function upsertCenterProfile(
  payload: CenterProfileUpdateRequest
): Promise<CenterProfile> {
  return api<CenterProfile>("/shelter/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
