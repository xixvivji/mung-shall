// src/features/adoption/api/adoptionApi.ts
import { ApiError, api } from "@/shared/api/client";
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

type StartAdoptionResponse = {
  id?: number;
  adoptionId?: number;
  adoption_id?: number;
};

export type RegionItem = {
  orgCd: string;
  name: string;
};

// --- Ï§ëÎ≥µ ?îÏ≤≠ Î∞©Ï???Î≥Ä??---
let inflightKey = "";
let inflightController: AbortController | null = null;
const ALLOWED_SORT_FIELDS: string[] = [];

// --- API Functions ---

/** Í≤¨Ï¢Ö Î™©Î°ù Ï°∞Ìöå */
export async function fetchDogKinds(): Promise<string[]> {
  const data = await api<string[]>("/dogs/kinds");
  if (!Array.isArray(data)) return [];
  return data.filter((value): value is string => typeof value === "string");
}

/** ????Î™©Î°ù Ï°∞Ìöå */
export async function fetchSidoList(): Promise<RegionItem[]> {
  const data = await api<unknown[]>("/region/sido");
  return normalizeRegionItems(data);
}

/** ??Íµ?Íµ?Î™©Î°ù Ï°∞Ìöå */
export async function fetchSigunguList(sidoOrgCd: string): Promise<RegionItem[]> {
  if (!sidoOrgCd) return [];
  const data = await api<unknown[]>(`/region/sido/${encodeURIComponent(sidoOrgCd)}/sigungu`);
  return normalizeRegionItems(data);
}

/** ?†Í∏∞Í≤?Î™©Î°ù Ï°∞Ìöå (?ÑÌÑ∞Îß? ?òÏù¥Ïß? */
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

  // Ï§ëÎ≥µ ?îÏ≤≠ Ï∑®ÏÜå Î°úÏßÅ
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

/**
 * ¿‘æÁ Ω≈√ª «¡∑ŒººΩ∫ Ω√¿€
 * - Swagger/Network ≈«ø°º≠ ø‰√ª πŸµ(« ºˆ/º±≈√)øÕ ¿¿¥‰ ≈∞(adoptionId µÓ)∏¶ »Æ¿Œ«œººø‰.
 */
export async function startAdoption(dogId: number): Promise<{ adoptionId: number }> {
  if (!Number.isFinite(dogId)) {
    throw new Error("Invalid dogId.");
  }

  // NOTE: If the backend rejects a request body, it may respond with 415/400.
  // Use the fallback below (retry without body) or remove the body per Swagger.
  const payload = { dogId };

  const request = (withBody: boolean) =>
    api<StartAdoptionResponse | number | string | null>("/adoptions", {
      method: "POST",
      body: withBody ? JSON.stringify(payload) : undefined,
    });

  let data: StartAdoptionResponse | number | string | null;
  try {
    data = await request(true);
  } catch (err) {
    if (shouldRetryWithoutBody(err)) {
      data = await request(false);
    } else {
      throw err;
    }
  }

  const adoptionId = resolveAdoptionId(data);
  if (!adoptionId) {
    throw new Error("Failed to resolve adoptionId from create response.");
  }
  return { adoptionId };
}

export async function startAdoptionProcess(dogId: number): Promise<{ adoptionId: number }> {
  return startAdoption(dogId);
}

// --- Helper Functions ---

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function resolveAdoptionId(data: unknown): number | null {
  if (typeof data === "number") return data;
  if (typeof data === "string") return toNumber(data);
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  return (
    toNumber(record.adoptionId) ??
    toNumber(record.adoption_id) ??
    toNumber(record.id) ??
    null
  );
}

function shouldRetryWithoutBody(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 415) return true;
  if (error.status !== 400) return false;
  return /body|payload|request|∫ªπÆ|πŸµ/i.test(error.message ?? "");
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
