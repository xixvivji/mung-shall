import { api } from "@/shared/api/client";

export type LikedDog = {
  dogId: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  careNm?: string;
};

export async function getLikedDogs(): Promise<LikedDog[]> {
  return api<LikedDog[]>("/members/me/liked-dogs");
}

export async function likeDog(dogId: number | string): Promise<void> {
  if (import.meta.env.DEV) {
    console.debug("[like] POST /dogs/{dogId}/like", { dogId });
  }
  await api<void>(`/dogs/${dogId}/like`, { method: "POST" });
}

export async function unlikeDog(dogId: number | string): Promise<void> {
  if (import.meta.env.DEV) {
    console.debug("[like] DELETE /dogs/{dogId}/like", { dogId });
  }
  await api<void>(`/dogs/${dogId}/like`, { method: "DELETE" });
}
