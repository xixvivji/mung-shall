import { api } from "@/shared/api/client";
import type { AdoptionDog } from "../types";

type DogSummaryResponse = {
  dogId: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
};

type DogsResponse = {
  content: DogSummaryResponse[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

type FetchAdoptionParams = {
  page?: number;
  size?: number;
  sort?: string;
  region?: string;
  sexCd?: string;
  processState?: string;
  breed?: string;
};

type FetchAdoptionResult = {
  items: AdoptionDog[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
};

export async function fetchDogKinds(): Promise<string[]> {
  const response = await fetch("/api/dogs/kinds");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.filter((value): value is string => typeof value === "string");
}

export async function fetchAdoptionList({
  page = 10,
  size = 12,
  sort = "happenDt",
  region,
  sexCd,
  processState,
  breed,
}: FetchAdoptionParams = {}): Promise<FetchAdoptionResult> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", sort);

  if (region) params.set("region", region);
  if (sexCd) params.set("sexCd", sexCd);
  if (processState) params.set("processState", processState);
  if (breed) params.set("breed", breed);

  const data = await api<DogsResponse>(`/dogs?${params.toString()}`);

  return {
    items: data.content.map((dog) => ({
      id: String(dog.dogId),
      name: dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`,
      breed: dog.kindNm ?? "Unknown",
      age: dog.age ?? "",
      imageUrl: dog.imageUrl,
    })),
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    page: data.number,
    size: data.size,
  };
}
