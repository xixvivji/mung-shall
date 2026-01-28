import { api } from "@/shared/api/client";
import type { AdoptionDetail } from "../types";

type DogDetailResponse = {
  id: number;
  desertionNo?: string;
  noticeNo?: string;
  kindNm?: string;
  careNm?: string;
  specialMark?: string;
  popfile1?: string;
  popfile2?: string;
};

export async function fetchAdoptionDetail(id: string): Promise<AdoptionDetail> {
  const data = await api<DogDetailResponse>(`/dogs/${id}`);

  return {
    id: String(data.id ?? id),
    name: data.noticeNo ?? data.desertionNo ?? data.kindNm ?? `Dog #${data.id ?? id}`,
    breed: data.kindNm ?? "Unknown",
    description: data.specialMark ?? "",
    images: [data.popfile1, data.popfile2].filter(Boolean) as string[],
  };
}
