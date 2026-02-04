// src/features/adoption/api/adoptionApi.ts
import { api } from "@/shared/api/client";
import type { AdoptionDog } from "../types";

// --- Types ---
type DogSummaryResponse = {
  dogId: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
  adopting?: boolean;
  processState?: string;
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
  kindNm?: string;
  signal?: AbortSignal;
};

type FetchAdoptionResult = {
  items: AdoptionDog[];
  totalPages: number;
  totalElements: number;
  page: number;
  size: number;
};

export type StartAdoptionRequest = {
  userId: number;
  abandonedDogId: number;
};

export type StartAdoptionResponse = {
  adoptionId: string;
};

export type RegionItem = {
  orgCd: string;
  name: string;
};

// --- 중복 요청 방지 변수 ---
let inflightKey = "";
let inflightController: AbortController | null = null;
const ALLOWED_SORT_FIELDS: string[] = [];

// --- API Functions ---

/** 견종 목록 조회 */
export async function fetchDogKinds(): Promise<string[]> {
  const data = await api<string[]>("/dogs/kinds");
  if (!Array.isArray(data)) return [];
  return data.filter((value): value is string => typeof value === "string");
}

/** 시도 목록 조회 */
export async function fetchSidoList(): Promise<RegionItem[]> {
  const data = await api<unknown[]>("/region/sido");
  return normalizeRegionItems(data);
}

/** 시군구 목록 조회 */
export async function fetchSigunguList(sidoOrgCd: string): Promise<RegionItem[]> {
  if (!sidoOrgCd) return [];
  const data = await api<unknown[]>(`/region/sido/${encodeURIComponent(sidoOrgCd)}/sigungu`);
  return normalizeRegionItems(data);
}

/** 입양견 목록 조회 (필터/페이지) */
export async function fetchAdoptionList({
                                          page = 0,
                                          size = 12,
                                          sort,
                                          region,
                                          sexCd,
                                          processState,
                                          kindNm,
                                          signal,
                                        }: FetchAdoptionParams = {}): Promise<FetchAdoptionResult> {

  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const normalizedSort = normalizeSort(sort);
  if (normalizedSort) params.set("sort", normalizedSort);

  if (region) params.set("region", region);
  if (sexCd) params.set("sexCd", sexCd);
  if (processState) params.set("processState", processState);
  if (kindNm) params.set("kindNm", kindNm);

  const requestPath = `/dogs?${params.toString()}`;

  // 중복 요청 취소 로직
  if (inflightKey === requestPath && inflightController) {
    inflightController.abort();
  }
  inflightKey = requestPath;
  inflightController = new AbortController();

  if (import.meta.env.DEV) {
    console.debug("[adoption] fetchAdoptionList", { requestPath });
  }

  const controller = inflightController;

  try {
    const data = await api<DogsResponse>(requestPath, {
      signal: signal ?? controller?.signal,
    });
    return {
      items: data.content.map((dog) => ({
        id: String(dog.dogId),
        name: dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`,
        breed: dog.kindNm ?? "Unknown",
        age: dog.age ?? "",
        imageUrl: dog.imageUrl,
        adopting: dog.adopting,
        processState: dog.processState,
      })),
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      page: data.number,
      size: data.size,
    };
  } finally {
    if (inflightController === controller) {
      inflightController = null;
      inflightKey = "";
    }
  }
}

/**
 * 입양 신청 프로세스 시작
 * - Swagger/Network 탭에서 요청 바디(필수/선택)와 응답 키(adoptionId 등)를 확인하세요.
 */
export async function startAdoption(payload: StartAdoptionRequest): Promise<StartAdoptionResponse> {
  const data = await api<unknown>("/adoptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const adoptionId = resolveAdoptionId(data);
  if (!adoptionId) {
    throw new Error("Failed to resolve adoptionId from create response.");
  }
  return { adoptionId };
}

export async function startAdoptionProcess(
  payload: StartAdoptionRequest
): Promise<StartAdoptionResponse> {
  return startAdoption(payload);
}

// --- Helper Functions ---

function resolveAdoptionId(data: unknown): string | null {
  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof data === "number" && Number.isFinite(data)) {
    return String(data);
  }
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const raw = record.adoptionId ?? record.adoption_id ?? record.id;
  if (typeof raw === "string") return raw.trim().length > 0 ? raw : null;
  if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
  return null;
}

function normalizeRegionItems(data: unknown): RegionItem[] {
  if (!Array.isArray(data)) return [];
  const map = new Map<string, RegionItem>();
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { orgCd?: unknown; name?: unknown; orgdownNm?: unknown };
    const orgCd = typeof item.orgCd === "string" ? item.orgCd.trim() : "";
    const nameSource =
        typeof item.orgdownNm === "string" ? item.orgdownNm :
            typeof item.name === "string" ? item.name : "";

    const name = nameSource.trim();
    if (!orgCd || !name) continue;

    if (!map.has(orgCd)) {
      map.set(orgCd, { orgCd, name });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

function normalizeSort(value?: string) {
  const raw = value?.trim();
  if (!raw) return null;
  const [field, direction] = raw.includes(",") ? raw.split(",") : [raw, "desc"];

  const safeField = field?.trim();
  const safeDirection = direction?.trim().toLowerCase();

  if (!safeField) return null;
  if (ALLOWED_SORT_FIELDS.length > 0 && !ALLOWED_SORT_FIELDS.includes(safeField)) return null;

  if (safeDirection === "asc" || safeDirection === "desc") {
    return `${safeField},${safeDirection}`;
  }
  return null;
}
