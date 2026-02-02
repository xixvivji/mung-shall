import { api } from "@/shared/api/client";

export type CommentItem = {
    id: number;
    content: string;

    authorName?: string;

    authorId?: number;

    createdAt?: string;
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
    content?: unknown;

    createdAt?: unknown;
    updatedAt?: unknown;

    replies?: unknown;

    likeCount?: unknown;
    likedByMe?: unknown;
};

const toNumber = (v: unknown, fallback = 0) => {
    if (typeof v === "number") return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
    return fallback;
};

const toString = (v: unknown, fallback = "") => {
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    return fallback;
};

function normalizeComment(raw: unknown): CommentItem {
    if (!raw || typeof raw !== "object") return { id: 0, content: "" };
    const c = raw as RawComment;

    const item: CommentItem = {
        id: toNumber(c.id, 0),
        parentCommentId:
            c.parentCommentId === null || c.parentCommentId === undefined
                ? null
                : toNumber(c.parentCommentId, null as any),

        authorName: toString(c.writer, "익명"),

        content: toString(c.content, ""),
        createdAt: toString(c.createdAt, ""),

        likeCount: typeof c.likeCount === "number" ? c.likeCount : toNumber(c.likeCount, 0),
        likedByMe: typeof c.likedByMe === "boolean" ? c.likedByMe : Boolean(c.likedByMe),
    };

    if (Array.isArray(c.replies)) {
        item.replies = c.replies.map(normalizeComment);
    } else {
        item.replies = [];
    }

    return item;
}

export async function fetchBoardCommentsPage(boardId: string, params?: { page?: number; size?: number }) {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const qs = search.toString();
    const url = qs ? `/boards/${boardId}/comments?${qs}` : `/boards/${boardId}/comments`;

    const data = await api<any>(url, { method: "GET" });

    const content = Array.isArray(data?.content) ? data.content : [];
    const normalized = content.map(normalizeComment);

    const result: CommentPageResponse = {
        content: normalized,
        page: typeof data?.page === "number" ? data.page : undefined,
        size: typeof data?.size === "number" ? data.size : undefined,
        totalPages: typeof data?.totalPages === "number" ? data.totalPages : undefined,
        totalElements: typeof data?.totalElements === "number" ? data.totalElements : undefined,

        hasNext: typeof data?.last === "boolean" ? !data.last : undefined,
    };

    return result;
}

export async function fetchBoardComments(boardId: string, params?: { page?: number; size?: number }) {
    const data = await fetchBoardCommentsPage(boardId, params);
    return Array.isArray(data?.content) ? data.content : [];
}

export async function createBoardComment(boardId: string, payload: { content: string; parentCommentId?: number | null }) {
    return api(`/boards/${boardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: payload.content,
            parentCommentId: payload.parentCommentId ?? null,
        }),
    });
}

export async function toggleCommentLike(commentId: number): Promise<{ likedByMe: boolean; likeCount: number }> {
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
