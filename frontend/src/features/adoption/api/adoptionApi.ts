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

export type RegionItem = {
  orgCd: string;
  name: string;
};

// --- 중복 요청 방지용 변수 ---
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

/** 시/도 목록 조회 */
export async function fetchSidoList(): Promise<RegionItem[]> {
  const data = await api<unknown[]>("/region/sido");
  return normalizeRegionItems(data);
}

/** 시/군/구 목록 조회 */
export async function fetchSigunguList(sidoOrgCd: string): Promise<RegionItem[]> {
  if (!sidoOrgCd) return [];
  const data = await api<unknown[]>(`/region/sido/${encodeURIComponent(sidoOrgCd)}/sigungu`);
  return normalizeRegionItems(data);
}

/** 유기견 목록 조회 (필터링, 페이징) */
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

/** * 입양 신청 프로세스 시작 (추가된 함수)
 * - client.post 대신 api() 함수 사용
 */
export async function startAdoptionProcess(dogId: number): Promise<{ adoptionId: number }> {
  return api<{ adoptionId: number }>("/v1/adoptions", {
    method: "POST",
    body: JSON.stringify({ dogId }),
  });
}

// --- Helper Functions ---

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