import { api } from "@/shared/api/client";
import type { AdoptionDetail } from "../types";
import type { AdoptionStatus } from "@/features/adoption/types";
import { resolveAdoptionStatusFromServer } from "../utils/adoptionStatus";

type DogDetailResponse = {
  id: number;
  adoptionStatus?: AdoptionStatus | string;
  adopting?: boolean;
  desertionNo?: string;
  noticeNo?: string;
  kindNm?: string;
  happenPlace?: string;
  colorCd?: string;
  careNm?: string;
  careAddr?: string;
  careTel?: string;
  careOwnerNm?: string;
  sexCd?: string;
  age?: string;
  weight?: string;
  noticeSdt?: string;
  noticeEdt?: string;
  processState?: string;
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
    adoptionStatus: resolveAdoptionStatusFromServer(data.adoptionStatus),
    adopting: data.adopting,
    noticeNo: data.noticeNo,
    desertionNo: data.desertionNo,
    careNm: data.careNm,
    careAddr: data.careAddr,
    careTel: data.careTel,
    careOwnerNm: data.careOwnerNm,
    sexCd: data.sexCd,
    colorCd: data.colorCd,
    age: data.age,
    weight: data.weight,
    happenPlace: data.happenPlace,
    noticeSdt: data.noticeSdt,
    noticeEdt: data.noticeEdt,
    processState: data.processState,
  };
}
