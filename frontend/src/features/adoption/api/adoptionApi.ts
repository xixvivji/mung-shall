import { api } from "@/shared/api/client";
import type { AdoptionDog } from "../types";

type DogSummaryResponse = {
  dogId: number;
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

export async function fetchAdoptionList(
  page = 0,
  size = 1,
  sort = "happenDt",
): Promise<AdoptionDog[]> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort,
  });
  const data = await api<DogsResponse>(`/dogs?${params.toString()}`);

  return data.content.map((dog) => ({
    id: String(dog.dogId),
    name: dog.kindNm ?? "Unknown",
    breed: dog.kindNm ?? dog.careNm ?? "Unknown",
    age: dog.age ?? "",
    imageUrl: dog.imageUrl,
  }));
}
