import { api } from "@/shared/api/client";

export type CommentItem = {
    id: number;
    content: string;
    authorName?: string;
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

export type ToggleLikeResponse = {
    likedByMe: boolean;
    likeCount: number;
};

// 댓글 목록 조회 (페이지 응답을 그대로 받고 싶을 때)
export async function fetchBoardCommentsPage(
    boardId: string,
    params?: { page?: number; size?: number }
) {
    const search = new URLSearchParams();
    if (params?.page !== undefined) search.set("page", String(params.page));
    if (params?.size !== undefined) search.set("size", String(params.size));

    const qs = search.toString();
    const url = qs ? `/boards/${boardId}/comments?${qs}` : `/boards/${boardId}/comments`;

    return api<CommentPageResponse>(url, { method: "GET" });
}

// 댓글 목록 조회 (기존 UI 호환: content만 뽑아서 배열 반환)
export async function fetchBoardComments(
    boardId: string,
    params?: { page?: number; size?: number }
) {
    const data = await fetchBoardCommentsPage(boardId, params);
    return Array.isArray(data?.content) ? data.content : [];
}

// 댓글 작성
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

export async function toggleCommentLike(commentId: number | string): Promise<ToggleLikeResponse> {
    const data = await api<any>(`/comments/${commentId}/likes`, {
        method: "POST",
    });

    const likedByMe =
        Boolean(data?.likedByMe) ||
        Boolean(data?.liked) ||
        Boolean(data?.isLiked) ||
        Boolean(data?.myLiked) ||
        false;

    const likeCountRaw = data?.likeCount ?? data?.likes ?? data?.count ?? data?.likeCnt;
    const likeCount = typeof likeCountRaw === "number" ? likeCountRaw : Number(likeCountRaw ?? 0);

    return { likedByMe, likeCount };
}
