import { api } from "@/shared/api/client";
import type { CreateFaqRequest, Faq, PageResult, UpdateFaqRequest } from "../types";

/** Swagger 기준 FAQ 단건 응답 */
type FaqResponse = {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

/** Swagger 기준 Page 응답 */
type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-based)
};

function mapFaq(d: FaqResponse): Faq {
  return {
    id: String(d.id),
    question: d.question ?? "",
    answer: d.answer ?? "",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

/**
 * api()가 params 옵션을 지원하지 않아서 쿼리스트링을 직접 만든다.
 * sort는 Spring Pageable 형태: sort=createdAt,desc (여러개면 반복)
 */
function buildFaqsQuery(params?: { page?: number; size?: number; sort?: string[] }) {
  const page = params?.page ?? 0;
  const size = params?.size ?? 50;
  const sort = params?.sort ?? [];

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  for (const s of sort) qs.append("sort", s);

  return qs.toString();
}

/** ✅ GET /api/faqs (페이지네이션) */
export async function fetchFaqs(params?: {
  page?: number;
  size?: number;
  sort?: string[];
}): Promise<PageResult<Faq>> {
  const query = buildFaqsQuery(params);
  const data = await api<PageResponse<FaqResponse>>(`/faqs?${query}`);

  return {
    items: (data.content ?? []).map(mapFaq),
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    page: data.number ?? (params?.page ?? 0),
    size: data.size ?? (params?.size ?? 50),
  };
}

/** ✅ GET /api/faqs/{id} */
export async function fetchFaqById(id: string): Promise<Faq> {
  const data = await api<FaqResponse>(`/faqs/${id}`);
  return mapFaq(data);
}

/** ✅ POST /api/faqs */
export async function createFaq(body: CreateFaqRequest): Promise<Faq> {
  const data = await api<FaqResponse>(`/faqs`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return mapFaq(data);
}

/** ✅ PUT /api/faqs/{id} */
export async function updateFaq(id: string, body: UpdateFaqRequest): Promise<Faq> {
  const data = await api<FaqResponse>(`/faqs/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return mapFaq(data);
}

/** ✅ DELETE /api/faqs/{id} (204) */
export async function deleteFaq(id: string): Promise<void> {
  await api<void>(`/faqs/${id}`, {
    method: "DELETE",
  });
}
