import { ApiError, api } from "@/shared/api/client";
import type { AdoptionProcessStatus, AdoptionStatusSummary, LikedDog } from "../types";

type LikedDogResponse = {
  dogId: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
};

export type FetchLikedDogsResult = {
  status: "ok" | "unauthenticated" | "error";
  items: LikedDog[];
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const resolveAdoptionId = (data: unknown): number | null => {
  if (typeof data === "number") return data;
  if (typeof data === "string") return toNumber(data);
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  return (
    toNumber(record.id) ??
    toNumber(record.adoptionId) ??
    toNumber(record.adoption_id) ??
    null
  );
};

export async function fetchLikedDogs(): Promise<FetchLikedDogsResult> {
  try {
    const data = await api<LikedDogResponse[]>("/members/me/liked-dogs");
    if (!Array.isArray(data)) {
      return { status: "ok", items: [] };
    }
    return {
      status: "ok",
      items: data.map((dog) => ({
        id: String(dog.dogId),
        name: dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`,
        breed: dog.kindNm,
        age: dog.age,
        imageUrl: dog.imageUrl,
        centerName: dog.careNm,
      })),
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return { status: "unauthenticated", items: [] };
    }
    return { status: "error", items: [] };
  }
}

export async function fetchAdoptionsByStatus(
  userId: number,
  status: AdoptionProcessStatus
): Promise<AdoptionStatusSummary[]> {
  const params = new URLSearchParams({
    userId: String(userId),
    status,
  });
  const data = await api<unknown>(`/adoptions?${params.toString()}`);
  const rawItems = Array.isArray(data) ? data : data ? [data] : [];
  return rawItems
    .map((item) => normalizeAdoptionStatus(item))
    .filter((item): item is AdoptionStatusSummary => Boolean(item));
}

export async function cancelAdoptionProcess(adoptionId: number): Promise<void> {
  await api<void>(`/adoptions/${adoptionId}`, { method: "DELETE" });
}

function normalizeAdoptionStatus(value: unknown): AdoptionStatusSummary | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const adoptionId = resolveAdoptionId(record);
  const dogId = toNumber(record.dogId ?? record.dog_id);

  if (!adoptionId || !dogId) return null;

  return {
    adoptionId,
    dogId,
    userId: toNumber(record.userId ?? record.user_id) ?? undefined,
    imageUrl: typeof record.imageUrl === "string" ? record.imageUrl : undefined,
    kindNm: typeof record.kindNm === "string" ? record.kindNm : undefined,
    age: typeof record.age === "string" ? record.age : undefined,
    weight: typeof record.weight === "string" ? record.weight : undefined,
    careNm: typeof record.careNm === "string" ? record.careNm : undefined,
    processStatus:
      typeof record.processStatus === "string"
        ? (record.processStatus as AdoptionProcessStatus)
        : undefined,
  };
}

export type CounselingResponse = {
  id: number;
  adoptionId: number;
  counselingDate: string;
  status: "SCHEDULED" | "CANCELLED" | "COMPLETED" | string;
};

export async function getCounseling(counselingId: number): Promise<CounselingResponse> {
  return api<CounselingResponse>(`/adoption/counseling/${counselingId}`);
}

export async function createCounseling(
  adoptionId: number,
  counselingDate: string
): Promise<CounselingResponse> {
  return api<CounselingResponse>(`/adoption/counseling`, {
    method: "POST",
    body: JSON.stringify({ adoptionId, counselingDate }),
  });
}

export async function updateCounseling(
  counselingId: number,
  adoptionId: number,
  counselingDate: string
): Promise<CounselingResponse> {
  return api<CounselingResponse>(`/adoption/counseling/${counselingId}`, {
    method: "PUT",
    body: JSON.stringify({ adoptionId, counselingDate }),
  });
}

export async function cancelCounseling(counselingId: number): Promise<void> {
  await api<void>(`/adoption/counseling/${counselingId}`, { method: "DELETE" });
}
