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

export type RegionItem = {
  orgCd: string;
  name: string;
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

function normalizeRegionItems(data: unknown): RegionItem[] {
  if (!Array.isArray(data)) return [];
  const map = new Map<string, RegionItem>();
  for (const raw of data) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as { orgCd?: unknown; name?: unknown; orgdownNm?: unknown };
    const orgCd = typeof item.orgCd === "string" ? item.orgCd.trim() : "";
    const nameSource =
      typeof item.orgdownNm === "string"
        ? item.orgdownNm
        : typeof item.name === "string"
        ? item.name
        : "";
    const name = nameSource.trim();
    if (!orgCd || !name) continue;
    if (!map.has(orgCd)) {
      map.set(orgCd, { orgCd, name });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export async function fetchSidoList(): Promise<RegionItem[]> {
  const response = await fetch("/api/region/sido");
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  const data = await response.json();
  return normalizeRegionItems(data);
}

export async function fetchSigunguList(sidoOrgCd: string): Promise<RegionItem[]> {
  if (!sidoOrgCd) return [];
  const response = await fetch(`/api/region/sido/${encodeURIComponent(sidoOrgCd)}/sigungu`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  const data = await response.json();
  return normalizeRegionItems(data);
}

export async function fetchAdoptionList({
  page = 0,
  size = 12,
  sort,
  region,
  sexCd,
  processState,
  breed,
}: FetchAdoptionParams = {}): Promise<FetchAdoptionResult> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  const normalizedSort = normalizeSort(sort);
  if (normalizedSort) {
    params.set("sort", normalizedSort);
  }

  if (region) params.set("region", region);
  if (sexCd) params.set("sexCd", sexCd);
  if (processState) params.set("processState", processState);
  if (breed) params.set("breed", breed);

  const requestPath = `/dogs?${params.toString()}`;
  if (import.meta.env.DEV) {
    const debugParams = Object.fromEntries(params.entries());
    console.debug("[adoption] fetchAdoptionList", { requestPath, params: debugParams });
  }
  const data = await api<DogsResponse>(requestPath);

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

function normalizeSort(value?: string) {
  const raw = value?.trim();
  if (!raw) return null;
  const [field, direction] = raw.includes(",") ? raw.split(",") : [raw, "desc"];
  const safeField = field?.trim();
  const safeDirection = direction?.trim().toLowerCase();
  if (!safeField) return null;
  if (!ALLOWED_SORT_FIELDS.includes(safeField)) return null;
  if (safeDirection === "asc" || safeDirection === "desc") {
    return `${safeField},${safeDirection}`;
  }
  return null;
}

// NOTE: Backend currently 500s on unsupported sort fields (e.g. happenDt,desc).
// Failing request example: /api/dogs?page=0&size=12&sort=happenDt,desc
// Suggested backend fix: return 400 for invalid sort, or document supported sort fields.
const ALLOWED_SORT_FIELDS: string[] = [];
