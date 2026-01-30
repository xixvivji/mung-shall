import { fetchMyInfo } from "@/features/member/api/memberApi";
import { ApiError, api } from "@/shared/api/client";
import type { LikedDog, MyDog, MyPageSummary } from "../types";

type LikedDogResponse = {
  dogId: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
};

export type FetchLikedDogsResult = {
  status: "ok" | "unauthenticated" | "error";
  items: LikedDog[];
};

export async function fetchMyPageSummary(): Promise<MyPageSummary> {
  const me = await fetchMyInfo();
  return { username: me.username, adoptedCount: 0 };
}

export async function fetchMyDogs(): Promise<MyDog[]> {
  const data = await api<LikedDogResponse[]>("/members/me/liked-dogs");
  if (!Array.isArray(data)) return [];
  return data.map((dog) => ({
    id: String(dog.dogId),
    name: dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`,
  }));
}

export async function fetchLikedDogs(): Promise<FetchLikedDogsResult> {
  try {
    const data = await api<LikedDogResponse[]>("/members/me/liked-dogs");
    if (!Array.isArray(data)) {
      return { status: "ok", items: [] };
    }
    return {
      status: "ok",
      items: data.map((dog) => ({
        id: String(dog.dogId),
        name: dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`,
        breed: dog.kindNm,
        age: dog.age,
        imageUrl: dog.imageUrl,
        centerName: dog.careNm,
      })),
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: "unauthenticated", items: [] };
    }
    return { status: "error", items: [] };
  }
}
