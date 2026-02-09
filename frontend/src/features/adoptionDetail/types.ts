import type { AdoptionStatus } from "@/features/adoption/types";

export type AdoptionDetail = {
  id: string;
  name: string;
  breed: string;
  description: string;
  images: string[];
  adoptionStatus: AdoptionStatus;
  adopting?: boolean;
  noticeNo?: string;
  desertionNo?: string;
  careNm?: string;
  careAddr?: string;
  careTel?: string;
  careOwnerNm?: string;
  sexCd?: string;
  colorCd?: string;
  age?: string;
  weight?: string;
  happenPlace?: string;
  noticeSdt?: string;
  noticeEdt?: string;
  processState?: string;
};
