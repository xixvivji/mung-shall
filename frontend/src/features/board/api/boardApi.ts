import { api, ApiError } from "@/shared/api/client";
import type {
  BoardCreateRequest,
  BoardDetail,
  BoardSummary,
  BoardUpdateRequest,
} from "../types";

export type BoardApiErrorType =
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "server_error"
    | "unknown";

export class BoardApiError extends Error {
  status: number;
  type: BoardApiErrorType;

  constructor(type: BoardApiErrorType, status: number, message: string) {
    super(message);
    this.name = "BoardApiError";
    this.type = type;
    this.status = status;
  }
}

const DEFAULT_ERROR_MESSAGE = "요청에 실패했습니다. 잠시 후 다시 시도해주세요.";

export function toBoardApiError(error: unknown): BoardApiError {
  if (error instanceof BoardApiError) return error;
  if (error instanceof ApiError) {
    const status = error.status;
    if (status === 401) return new BoardApiError("unauthenticated", status, "로그인이 필요합니다.");
    if (status === 403) return new BoardApiError("forbidden", status, "권한이 없습니다.");
    if (status === 404) return new BoardApiError("not_found", status, "게시글을 찾을 수 없습니다.");
    if (status >= 500) return new BoardApiError("server_error", status, DEFAULT_ERROR_MESSAGE);
    return new BoardApiError("unknown", status, error.message || DEFAULT_ERROR_MESSAGE);
  }
  if (error instanceof Error) {
    return new BoardApiError("unknown", 0, error.message || DEFAULT_ERROR_MESSAGE);
  }
  return new BoardApiError("unknown", 0, DEFAULT_ERROR_MESSAGE);
}

type BoardListResponse = {
  content?: unknown[];
  items?: unknown[];
  totalPages?: number;
  totalElements?: number;
  page?: number;
  size?: number;
};

type BoardDetailResponse = {
  id?: unknown;
  boardId?: unknown;
  writerId?: unknown;

  title?: unknown;
  content?: unknown;
  category?: unknown;

  writer?: unknown;

  authorName?: unknown;
  writerName?: unknown;

  createdAt?: unknown;
  createdDate?: unknown;
  updatedAt?: unknown;
  updatedDate?: unknown;

  viewCount?: unknown;
  commentCount?: unknown;
  mediaUrls?: unknown;
};

const safeString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
};

const safeId = (value: unknown, fallback: string) => {
  const text = safeString(value);
  return text || fallback;
};

const safeDate = (value: unknown) => {
  const text = safeString(value);
  return text || "-";
};

const safePreview = (value: unknown, fallback: string) => {
  const text = safeString(value);
  if (text) return text;
  return fallback ? `${fallback.slice(0, 120)}${fallback.length > 120 ? "..." : ""}` : "";
};

function normalizeSummary(raw: unknown, index: number): BoardSummary {
  if (!raw || typeof raw !== "object") {
    return {
      id: String(index),
      title: "제목 없음",
      authorName: "익명",
      createdAt: "-",
      preview: "",
    };
  }
  const item = raw as BoardDetailResponse;
  const id = safeId(item.id ?? item.boardId, String(index));
  const title = safeString(item.title, "제목 없음");
  const content = safeString(item.content);

  const authorName = safeString(item.writer ?? item.authorName ?? item.writerName, "익명");

  const createdAt = safeDate(item.createdAt ?? item.createdDate);
  const preview = safePreview((item as { preview?: unknown }).preview, content);

  return {
    id,
    title,
    authorName,
    createdAt,
    preview,
  };
}

function normalizeDetail(raw: unknown): BoardDetail {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      title: "제목 없음",
      content: "",
      authorName: "익명",
      createdAt: "-",
    };
  }
  const item = raw as BoardDetailResponse;
  return {
    id: safeId(item.id ?? item.boardId, ""),
    title: safeString(item.title, "제목 없음"),
    content: safeString(item.content, ""),

    authorName: safeString(item.writerName ?? item.writer ?? item.authorName ?? item.writerName, "익명"),
    authorId: typeof item.writerId === "number" ? item.writerId : Number(item.writerId) || undefined,

    createdAt: safeDate(item.createdAt ?? item.createdDate),
    updatedAt: safeString(item.updatedAt ?? item.updatedDate) || undefined,
  };
}

export async function fetchBoardList(params?: {
  page?: number;
  size?: number;

  q?: string;

  category?: string; // FREE/REVIEW
  sort?: string;     // createdAt/viewCount
}): Promise<{ items: BoardSummary[]; totalPages?: number }> {
  try {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    if (params?.q) search.set("keyword", params.q);

    if (params?.category) search.set("category", params.category);
    if (params?.sort) search.set("sort", params.sort);

    const query = search.toString();
    const data = await api<BoardListResponse>(`/boards${query ? `?${query}` : ""}`);

    const rawItems = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.content)
            ? data.content
            : Array.isArray(data as unknown)
                ? (data as unknown[])
                : [];

    const items = rawItems.map((item, index) => normalizeSummary(item, index));
    const totalPages = typeof data.totalPages === "number" ? data.totalPages : undefined;
    return { items, totalPages };
  } catch (error) {
    throw toBoardApiError(error);
  }
}

export async function fetchBoardDetail(id: string | number): Promise<BoardDetail> {
  try {
    const data = await api<BoardDetailResponse>(`/boards/${id}`);
    return normalizeDetail(data);
  } catch (error) {
    throw toBoardApiError(error);
  }
}

export async function createBoard(payload: BoardCreateRequest): Promise<{ id: string | number }> {
  try {
    const data = await api<Partial<BoardDetailResponse>>(`/boards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const id = safeId(data.id ?? data.boardId, "");
    return { id: id || "" };
  } catch (error) {
    throw toBoardApiError(error);
  }
}

export async function updateBoard(
    id: string | number,
    payload: BoardUpdateRequest
): Promise<void> {
  try {
    await api<void>(`/boards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw toBoardApiError(error);
  }
}

export async function deleteBoard(id: string | number): Promise<void> {
  try {
    await api<void>(`/boards/${id}`, { method: "DELETE" });
  } catch (error) {
    throw toBoardApiError(error);
  }
}
