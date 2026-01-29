import { api } from "@/shared/api/client";

export type MemberMeResponse = {
  userId: number;
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  loginType: string;
  userType: "shelter" | "adopter" | "admin";
};

type CenterDogApiItem = {
  dogId?: number;
  id?: number;
  desertionNo?: string;
  kindNm?: string;
  name?: string;
  imageUrl?: string;
  noticeNo?: string;
  processState?: string;
};

type CenterDogsResponse = {
  content?: CenterDogApiItem[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
} | CenterDogApiItem[];

export type CenterDog = {
  id: string;
  kind: string;
  status: string;
  desertionNo: string;
  imageUrl?: string;
};

export async function fetchMe(): Promise<MemberMeResponse> {
  return api<MemberMeResponse>("/members/me");
}

function mapDog(item: CenterDogApiItem): CenterDog {
  const idValue = item.dogId ?? item.id;
  return {
    id: idValue ? String(idValue) : item.desertionNo ?? "",
    kind: item.kindNm ?? item.name ?? "Unknown",
    status: item.processState ?? "보호중",
    desertionNo: item.desertionNo ?? item.noticeNo ?? "",
    imageUrl: item.imageUrl,
  };
}

export async function fetchCenterDogs(shelterId: number): Promise<CenterDog[]> {
  const response = await api<CenterDogsResponse>(`/shelters/${shelterId}/dogs`);
  const list = Array.isArray(response) ? response : response.content ?? [];
  return list.map(mapDog);
}
