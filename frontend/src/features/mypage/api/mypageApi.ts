import { fetchMyInfo } from "@/features/member/api/memberApi";
import { api } from "@/shared/api/client";
import type { MyDog, MyPageSummary } from "../types";

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
