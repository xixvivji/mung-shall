import type { AdoptionDetail } from "../types";

export async function fetchAdoptionDetail(id: string): Promise<AdoptionDetail> {
  return {
    id,
    name: "Coco",
    breed: "Mixed",
    description: "사람을 좋아하고 산책을 좋아하는 친구예요.",
    images: [],
  };
}
