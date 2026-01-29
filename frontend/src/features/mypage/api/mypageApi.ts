import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MyDog, MyPageSummary } from "../types";

export async function fetchMyPageSummary(): Promise<MyPageSummary> {
  const me = await fetchMyInfo();
  return { username: me.username, adoptedCount: 2 };
}

export async function fetchMyDogs(): Promise<MyDog[]> {
  return [
    { id: "my-1", name: "Coco" },
    { id: "my-2", name: "Bori" },
  ];
}
