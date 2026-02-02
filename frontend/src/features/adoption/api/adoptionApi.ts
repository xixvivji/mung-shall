import { client } from "@/shared/api/client";

/**
 * 입양 절차를 시작합니다.
 * @param dogId 입양할 강아지의 ID
 * @returns 생성된 입양 절차 ID가 포함된 객체
 */
export async function startAdoptionProcess(dogId: number): Promise<{ adoptionId: number }> {
  const response = await client.post<{ adoptionId: number }>(`/api/v1/adoptions`, { dogId });
  return response.data;
}