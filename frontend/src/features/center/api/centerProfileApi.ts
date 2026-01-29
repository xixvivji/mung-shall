import { api } from "@/shared/api/client";
import type {
  CenterProfile,
  CenterProfileUpdateRequest,
  MemberMeResponse,
  ShelterProfileResponse,
  ShelterProfileUpdateRequest,
} from "../profile/types";

export async function fetchMe(): Promise<MemberMeResponse> {
  return api<MemberMeResponse>("/members/me");
}

function mapShelterProfile(response: ShelterProfileResponse): CenterProfile {
  return {
    centerName: response.careNm ?? "",
    phoneNumber: response.tel ?? "",
    address: response.address ?? "",
    description: "",
  };
}

export async function fetchCenterProfile(_shelterId: number): Promise<CenterProfile> {
  const response = await api<ShelterProfileResponse>("/shelters/me");
  return mapShelterProfile(response);
}

export async function upsertCenterProfile(
  _shelterId: number,
  payload: CenterProfileUpdateRequest
): Promise<CenterProfile> {
  const requestPayload: ShelterProfileUpdateRequest = {
    careNm: payload.centerName,
    tel: payload.phoneNumber,
    address: payload.address,
  };

  const response = await api<ShelterProfileResponse>("/shelters/me", {
    method: "PUT",
    body: JSON.stringify(requestPayload),
  });
  return mapShelterProfile(response);
}
