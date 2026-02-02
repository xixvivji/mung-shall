import { api } from "@/shared/api/client";

export type CommentItem = {
    id: number;
    content: string;

    authorName?: string;
    authorId?: number;

    createdAt?: string;
    updatedAt?: string;

    parentCommentId?: number | null;

    likeCount?: number;
    likedByMe?: boolean;

    replies?: CommentItem[];
};

export type CommentPageResponse = {
    content: CommentItem[];
    page?: number;
    size?: number;
    totalPages?: number;
    totalElements?: number;
    hasNext?: boolean;
};

type RawComment = {
    id?: unknown;
    parentCommentId?: unknown;

    writer?: unknown;
    writerId?: unknown;

    content?: unknown;

    createdAt?: unknown;
    updatedAt?: unknown;

    replies?: unknown;

    likeCount?: unknown;
    likedByMe?: unknown;
};

const toNumber = (v: unknown): number | undefined => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
    return undefined;
};

const toString = (v: unknown, fallback = "") => {
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    return fallback;
};

const toBoolean = (v: unknown): boolean | undefined => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v !== 0;
    if (typeof v === "string") {
        const s = v.trim().toLowerCase();
        if (s === "true") return true;
        if (s === "false") return false;
    }
    return undefined;
};

const normalizeParentId = (v: unknown): number | null => {
    if (v === null || v === undefined) return null;
    const n = toNumber(v);
    return typeof n === "number" ? n : null;
};

function normalizeComment(raw: unknown): CommentItem {
    if (!raw || typeof raw !== "object") return { id: 0, content: "", replies: [] };
    const c = raw as RawComment;

    const item: CommentItem = {
        id: toNumber(c.id) ?? 0,

        parentCommentId: normalizeParentId(c.parentCommentId),

        authorName: toString(c.writer, "익명"),
        authorId: toNumber(c.writerId),

        content: toString(c.content, ""),
        createdAt: toString(c.createdAt, ""),
        updatedAt: toString(c.updatedAt, ""),

        likeCount: toNumber(c.likeCount) ?? 0,
        likedByMe: toBoolean(c.likedByMe) ?? false,

        replies: [],
    };

    if (Array.isArray(c.replies)) {
        item.replies = c.replies.map(normalizeComment);
    }

    return item;
}

export async function fetchBoardCommentsPage(
    boardId: string,
    params?: { page?: number; size?: number }
): Promise<CommentPageResponse> {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const qs = search.toString();
    const url = qs ? `/boards/${boardId}/comments?${qs}` : `/boards/${boardId}/comments`;

    const data = await api<any>(url, { method: "GET" });

    const contentRaw = Array.isArray(data?.content) ? data.content : [];
    const normalized = contentRaw.map(normalizeComment);

    const totalPages = toNumber(data?.totalPages);
    const totalElements = toNumber(data?.totalElements);
    const page = toNumber(data?.page);
    const size = toNumber(data?.size);

    const last = toBoolean(data?.last);
    const hasNext = typeof last === "boolean" ? !last : undefined;

    return {
        content: normalized,
        page,
        size,
        totalPages,
        totalElements,
        hasNext,
    };
}

export async function fetchBoardComments(
    boardId: string,
    params?: { page?: number; size?: number }
) {
    const data = await fetchBoardCommentsPage(boardId, params);
    return Array.isArray(data?.content) ? data.content : [];
}

export async function createBoardComment(
    boardId: string,
    payload: { content: string; parentCommentId?: number | null }
) {
    return api(`/boards/${boardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: payload.content,
            parentCommentId: payload.parentCommentId ?? null,
        }),
    });
}

export async function toggleCommentLike(
    commentId: number
): Promise<{ likedByMe: boolean; likeCount: number }> {
    const data = await api<any>(`/comments/${commentId}/likes`, { method: "POST" });

    return {
        likedByMe: Boolean(data?.liked),
        likeCount: typeof data?.likeCount === "number" ? data.likeCount : 0,
    };
}

export async function updateComment(commentId: number, payload: { content: string }) {
    return api(`/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: payload.content }),
    });
}

export async function deleteComment(commentId: number) {
    return api(`/comments/${commentId}`, { method: "DELETE" });
}
