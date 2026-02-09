import type { RecommendDog } from "../types";

export async function fetchRecommendList(): Promise<RecommendDog[]> {
  return [
    { id: "rec-1", name: "Bori", description: "활발하고 사람을 좋아해요." },
    { id: "rec-2", name: "Nori", description: "산책을 즐기는 친구예요." },
    { id: "rec-3", name: "Dori", description: "조용하고 차분한 성격이에요." },
  ];
}
