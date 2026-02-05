import { api } from "@/shared/api/client";

export type RandomDogImage = {
  id: number;
  imageUrls: string[];
};

export async function getRandomDogImages(limit = 15) {
  return api<RandomDogImage[]>("/dogs/images/random", {
    // method 안 써도 기본 GET이지만, 명시해도 OK
    method: "GET",
  });
}
