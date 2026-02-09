import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

import { deleteBoard, fetchBoardDetail, toBoardApiError } from "../api/boardApi";
import type { BoardDetail } from "../types";

import {
  createBoardComment,
  fetchBoardComments,
  toggleCommentLike,
  updateComment,
  deleteComment,
} from "../api/commentApi";
import type { CommentItem } from "../api/commentApi";

import { authStore } from "@/features/auth/store/authStore";
import { formatDateTime } from "@/shared/utils/datetime";

export default function BoardDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { openAlert, alertProps } = useAlertModal();

  const [detail, setDetail] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [replyOpenFor, setReplyOpenFor] = useState<number | null>(null);
  const [replyTextById, setReplyTextById] = useState<Record<number, string>>({});
  const [replySubmittingFor, setReplySubmittingFor] = useState<number | null>(null);

  const [editOpenFor, setEditOpenFor] = useState<number | null>(null);
  const [editTextById, setEditTextById] = useState<Record<number, string>>({});
  const [editSubmittingFor, setEditSubmittingFor] = useState<number | null>(null);

  const [deleteCommentOpenFor, setDeleteCommentOpenFor] = useState<number | null>(null);
  const [deleteCommentSubmittingFor, setDeleteCommentSubmittingFor] = useState<number | null>(null);

  const [me, setMe] = useState(() => authStore.getSnapshot());
  useEffect(() => {
    return authStore.subscribe(() => setMe(authStore.getSnapshot()));
  }, []);

  const boardOwnerId = useMemo(() => {
    if (!detail) return null;
    const v = detail.authorId;
    return typeof v === "number" ? v : null;
  }, [detail]);

  const isOwner = useMemo(() => {
    if (!me || !detail) return false;
    if (typeof detail.authorId !== "number") return false;
    return me.userId === detail.authorId;
  }, [detail, me]);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setError("잘못된 접근입니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetchBoardDetail(id)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const boardError = toBoardApiError(err);
        if (boardError.type === "unauthenticated") {
          openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
        }
        setError(boardError.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, openAlert]);

  const handleDelete = useCallback(async () => {
    if (!id || deleting) return;
    setDeleting(true);

    try {
      await deleteBoard(id);
      navigate("/boards");
    } catch (err) {
      const boardError = toBoardApiError(err);
      if (boardError.type === "unauthenticated") {
        openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      } else if (boardError.type === "forbidden") {
        openAlert({ title: "권한 없음", message: "작성자만 삭제할 수 있습니다." });
      } else {
        openAlert({ title: "삭제 실패", message: boardError.message });
      }
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }, [deleting, id, navigate, openAlert]);

  const loadComments = useCallback(async () => {
    if (!id) return;
    setCommentLoading(true);
    setCommentError(null);

    try {
      const data = await fetchBoardComments(id, { page: 0, size: 50 });
      setComments(data);
    } catch (err) {
      setCommentError("댓글을 불러오지 못했습니다.");
    } finally {
      setCommentLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = useCallback(async () => {
    if (!id) return;
    const content = commentText.trim();
    if (!content) return;
    if (commentSubmitting) return;

    setCommentSubmitting(true);
    try {
      await createBoardComment(id, { content, parentCommentId: null });
      setCommentText("");
      await loadComments();
    } catch (err) {
      openAlert({
        title: "댓글 작성 실패",
        message: "로그인이 필요하거나 요청이 실패했습니다.",
      });
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentSubmitting, commentText, id, loadComments, openAlert]);

  const handleSubmitReply = useCallback(
    async (parentId: number) => {
      if (!id) return;
      if (replySubmittingFor === parentId) return;

      const raw = replyTextById[parentId] ?? "";
      const content = raw.trim();
      if (!content) return;

      setReplySubmittingFor(parentId);
      try {
        await createBoardComment(id, { content, parentCommentId: parentId });
        setReplyTextById((prev) => ({ ...prev, [parentId]: "" }));
        setReplyOpenFor(null);
        await loadComments();
      } catch (err) {
        openAlert({
          title: "답글 작성 실패",
          message: "로그인이 필요하거나 요청이 실패했습니다.",
        });
      } finally {
        setReplySubmittingFor(null);
      }
    },
    [id, loadComments, openAlert, replySubmittingFor, replyTextById]
  );

  const handleToggleLike = useCallback(
    async (commentId: number) => {
      try {
        const result = await toggleCommentLike(commentId);

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, likedByMe: result.likedByMe, likeCount: result.likeCount };
            }

            const replies = Array.isArray(c.replies) ? c.replies : [];
            if (replies.length === 0) return c;

            const nextReplies = replies.map((r) =>
              r.id === commentId ? { ...r, likedByMe: result.likedByMe, likeCount: result.likeCount } : r
            );

            return { ...c, replies: nextReplies };
          })
        );
      } catch (err) {
        openAlert({
          title: "좋아요 실패",
          message: "로그인이 필요하거나 요청이 실패했습니다.",
        });
      }
    },
    [openAlert]
  );

  const openEdit = useCallback((commentId: number, current: string) => {
    setEditOpenFor(commentId);
    setEditTextById((prev) => ({ ...prev, [commentId]: current }));
  }, []);

  const closeEdit = useCallback(() => {
    setEditOpenFor(null);
  }, []);

  const handleSubmitEdit = useCallback(
    async (commentId: number) => {
      if (editSubmittingFor === commentId) return;

      const content = (editTextById[commentId] ?? "").trim();
      if (!content) return;

      setEditSubmittingFor(commentId);
      try {
        await updateComment(commentId, { content });
        setEditOpenFor(null);
        await loadComments();
      } catch (err) {
        openAlert({
          title: "댓글 수정 실패",
          message: "로그인이 필요하거나 요청이 실패했습니다.",
        });
      } finally {
        setEditSubmittingFor(null);
      }
    },
    [editSubmittingFor, editTextById, loadComments, openAlert]
  );

  const handleDeleteComment = useCallback(
    async (commentId: number) => {
      if (deleteCommentSubmittingFor === commentId) return;

      setDeleteCommentSubmittingFor(commentId);
      try {
        await deleteComment(commentId);
        setDeleteCommentOpenFor(null);
        await loadComments();
      } catch (err) {
        openAlert({
          title: "댓글 삭제 실패",
          message: "로그인이 필요하거나 요청이 실패했습니다.",
        });
      } finally {
        setDeleteCommentSubmittingFor(null);
      }
    },
    [deleteCommentSubmittingFor, loadComments, openAlert]
  );

  const isMyComment = useCallback(
    (c: CommentItem) => {
      if (!me) return false;
      const authorId = c.authorId;
      return typeof authorId === "number" && me.userId === authorId;
    },
    [me]
  );

  const commentTree = useMemo(() => {
    return comments
      .filter((c) => c.parentCommentId == null)
      .map((c) => ({
        ...c,
        replies: Array.isArray(c.replies) ? c.replies : [],
      }));
  }, [comments]);

  const totalCommentCount = useMemo(() => {
    let count = 0;
    for (const c of commentTree) {
      count += 1;
      if (Array.isArray(c.replies)) count += c.replies.length;
    }
    return count;
  }, [commentTree]);

  // ✅ 첨부 이미지 모달
  const mediaUrls = useMemo(() => {
    return Array.isArray(detail?.mediaUrls) ? detail!.mediaUrls! : [];
  }, [detail]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setViewerOpen(false);
  }, []);

  const goPrev = useCallback(() => {
    setViewerIndex((prev) => (mediaUrls.length ? (prev - 1 + mediaUrls.length) % mediaUrls.length : 0));
  }, [mediaUrls.length]);

  const goNext = useCallback(() => {
    setViewerIndex((prev) => (mediaUrls.length ? (prev + 1) % mediaUrls.length : 0));
  }, [mediaUrls.length]);

  const currentUrl = mediaUrls[viewerIndex] ?? "";

  useEffect(() => {
    if (!viewerOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerOpen, closeViewer, goPrev, goNext]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">홈 &gt; 게시판 &gt; 상세</p>
          <h1 className="text-[32px] font-bold text-[#1F2937]">게시글 상세</h1>
        </div>

        <div className="mt-10 rounded-[16px] bg-white p-8 shadow-lg">
          {loading ? (
            <div className="text-sm text-[#6B7280]">Loading...</div>
          ) : error ? (
            <div className="text-sm text-[#d14343]">{error}</div>
          ) : detail ? (
            <div className="space-y-6">
              {/* ✅ 제목 라인 + 우측 수정/삭제 정렬 */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <h2 className="truncate text-2xl font-semibold text-[#1F2937]">{detail.title}</h2>
                  <div className="text-sm text-[#6B7280]">
                    {detail.authorName} · {formatDateTime(detail.createdAt)}
                    {detail.updatedAt ? ` · 수정 ${formatDateTime(detail.updatedAt)}` : ""}
                  </div>
                </div>

                {isOwner ? (
                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <Link
                      to={`/boards/${id}/edit`}
                      className="flex h-10 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
                    >
                      수정
                    </Link>

                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                      <button
                        type="button"
                        className="flex h-10 items-center justify-center rounded-[12px] border border-[#FCA5A5] bg-white px-4 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                        onClick={() => setDeleteOpen(true)}
                      >
                        삭제
                      </button>

                      <AlertDialogContent className="rounded-[16px] border border-[#E5E7EB]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>게시글 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            삭제한 게시글은 복구할 수 없습니다. 정말 삭제하시겠어요?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-[12px] border-[#E5E7EB]">취소</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-[12px] bg-[#EF4444] text-white hover:bg-[#DC2626]"
                            onClick={handleDelete}
                            disabled={deleting}
                          >
                            {deleting ? "삭제 중..." : "삭제"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ) : boardOwnerId !== null ? (
                  <div className="shrink-0 self-center text-xs text-[#9CA3AF]">작성자만 수정/삭제할 수 있습니다.</div>
                ) : null}
              </div>

              <div className="whitespace-pre-line text-sm leading-7 text-[#1F2937]">{detail.content}</div>

              {/* ✅ 첨부 이미지(잘림 방지 + 모달 크게보기) */}
              {mediaUrls.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-[#1F2937]">첨부 이미지</div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {mediaUrls.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        onClick={() => openViewer(idx)}
                        className="group rounded-[12px] border border-[#E5E7EB] bg-white p-2 text-left"
                        title="클릭해서 크게 보기"
                      >
                        <div className="flex items-center justify-center rounded-[10px] bg-[#F7F8FA] p-2">
                          <img
                            src={url}
                            alt={`board-media-${idx}`}
                            className="max-h-[280px] w-auto max-w-full object-contain"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-[#6B7280]">
                            {idx + 1} / {mediaUrls.length}
                          </span>
                          <span className="text-xs font-semibold text-[#2563EB] opacity-0 transition group-hover:opacity-100">
                            크게 보기
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 모달 갤러리 */}
                  {viewerOpen ? (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                      role="dialog"
                      aria-modal="true"
                      onClick={closeViewer}
                    >
                      <div
                        className="relative w-full max-w-[980px] rounded-[16px] bg-white shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
                          <div className="text-sm font-semibold text-[#111827]">
                            첨부 이미지 {viewerIndex + 1} / {mediaUrls.length}
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={currentUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="h-9 rounded-[10px] border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FA]"
                            >
                              다운로드
                            </a>

                            <button
                              type="button"
                              onClick={closeViewer}
                              className="h-9 rounded-[10px] bg-[#111827] px-3 text-sm font-semibold text-white hover:bg-[#0B1220]"
                            >
                              닫기
                            </button>
                          </div>
                        </div>

                        <div className="relative flex items-center justify-center bg-[#0B1220] p-3">
                          {mediaUrls.length > 1 ? (
                            <button
                              type="button"
                              onClick={goPrev}
                              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30"
                              aria-label="prev"
                            >
                              ◀
                            </button>
                          ) : null}

                          <img
                            src={currentUrl}
                            alt="viewer"
                            className="max-h-[72vh] w-auto max-w-full object-contain"
                            draggable={false}
                          />

                          {mediaUrls.length > 1 ? (
                            <button
                              type="button"
                              onClick={goNext}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30"
                              aria-label="next"
                            >
                              ▶
                            </button>
                          ) : null}
                        </div>

                        <div className="px-4 py-3 text-xs text-[#6B7280]">
                          단축키: <span className="font-semibold">← →</span> 이동,{" "}
                          <span className="font-semibold">ESC</span> 닫기
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {/* ✅ (기존 하단 수정/삭제 영역 제거됨) */}
              {/* 여기는 댓글부터 그대로 */}
              <div className="mt-8 border-t border-[#E5E7EB] pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1F2937]">댓글</h3>
                  <span className="text-sm text-[#6B7280]">{totalCommentCount}개</span>
                </div>

                    <div className="mt-4">
                    <div className="relative">
                        <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글을 입력하세요."
                        className="min-h-[96px] w-full resize-none rounded-[12px] border border-[#E5E7EB] p-4 pr-28 text-sm outline-none focus:border-[#93C5FD]"
                        />

                        <button
                        type="button"
                        onClick={handleSubmitComment}
                        disabled={commentSubmitting || !commentText.trim()}
                        className="absolute bottom-3 right-3 flex h-9 items-center justify-center rounded-[10px] bg-[#0064FF] px-4 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                        {commentSubmitting ? "등록 중..." : "등록"}
                        </button>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                  {commentLoading ? (
                    <div className="text-sm text-[#6B7280]">댓글 불러오는 중...</div>
                  ) : commentError ? (
                    <div className="text-sm text-[#d14343]">{commentError}</div>
                  ) : commentTree.length === 0 ? (
                    <div className="text-sm text-[#6B7280]">첫 댓글을 남겨보세요.</div>
                  ) : (
                    commentTree.map((c) => (
                      <div key={c.id} className="space-y-3">
                        <div className="rounded-[12px] border border-[#E5E7EB] p-4">
                          <div className="flex items-center justify-between text-xs text-[#6B7280]">
                            <span>{c.authorName ?? "익명"}</span>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleLike(c.id)}
                                className="text-xs font-semibold text-[#111827] hover:underline"
                                aria-label="comment-like"
                              >
                                {c.likedByMe ? "❤️" : "🤍"} {c.likeCount ?? 0}
                              </button>
                              <span>{formatDateTime(c.createdAt)}</span>
                            </div>
                          </div>

                          {editOpenFor === c.id ? (
                            <div className="mt-3 space-y-2">
                              <textarea
                                value={editTextById[c.id] ?? ""}
                                onChange={(e) =>
                                  setEditTextById((prev) => ({
                                    ...prev,
                                    [c.id]: e.target.value,
                                  }))
                                }
                                className="min-h-[84px] w-full resize-none rounded-[12px] border border-[#E5E7EB] p-3 text-sm outline-none focus:border-[#93C5FD]"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={closeEdit}
                                  className="h-10 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FA]"
                                >
                                  취소
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSubmitEdit(c.id)}
                                  disabled={editSubmittingFor === c.id || !(editTextById[c.id] ?? "").trim()}
                                  className="h-10 rounded-[12px] bg-[#111827] px-4 text-sm font-semibold text-white hover:bg-[#0B1220] disabled:opacity-50"
                                >
                                  {editSubmittingFor === c.id ? "저장 중..." : "저장"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 whitespace-pre-line text-sm text-[#1F2937]">{c.content}</div>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              className="text-sm font-semibold text-[#2563EB] hover:underline"
                              onClick={() => setReplyOpenFor((prev) => (prev === c.id ? null : c.id))}
                            >
                              {replyOpenFor === c.id ? "답글 닫기" : "답글 달기"}
                            </button>

                            {isMyComment(c) && editOpenFor !== c.id ? (
                              <>
                                <button
                                  type="button"
                                  className="text-sm font-semibold text-[#111827] hover:underline"
                                  onClick={() => openEdit(c.id, c.content)}
                                >
                                  수정
                                </button>

                                <button
                                  type="button"
                                  className="text-sm font-semibold text-[#B91C1C] hover:underline"
                                  onClick={() => setDeleteCommentOpenFor(c.id)}
                                >
                                  삭제
                                </button>
                              </>
                            ) : null}
                          </div>

                          {replyOpenFor === c.id && (
                            <div className="mt-3 space-y-2 rounded-[12px] bg-[#F9FAFB] p-3">
                              <textarea
                                value={replyTextById[c.id] ?? ""}
                                onChange={(e) =>
                                  setReplyTextById((prev) => ({
                                    ...prev,
                                    [c.id]: e.target.value,
                                  }))
                                }
                                placeholder="답글을 입력하세요."
                                className="min-h-[72px] w-full resize-none rounded-[12px] border border-[#E5E7EB] p-3 text-sm outline-none focus:border-[#93C5FD]"
                              />
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSubmitReply(c.id)}
                                  disabled={replySubmittingFor === c.id || !(replyTextById[c.id] ?? "").trim()}
                                  className="h-10 rounded-[12px] bg-[#111827] px-4 text-sm font-semibold text-white transition hover:bg-[#0B1220] disabled:opacity-50"
                                >
                                  {replySubmittingFor === c.id ? "등록 중..." : "답글 등록"}
                                </button>
                              </div>
                            </div>
                          )}

                          <AlertDialog
                            open={deleteCommentOpenFor === c.id}
                            onOpenChange={(open) => setDeleteCommentOpenFor(open ? c.id : null)}
                          >
                            <AlertDialogContent className="rounded-[16px] border border-[#E5E7EB]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  삭제한 댓글은 복구할 수 없습니다. 정말 삭제하시겠어요?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-[12px] border-[#E5E7EB]">취소</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-[12px] bg-[#EF4444] text-white hover:bg-[#DC2626]"
                                  onClick={() => handleDeleteComment(c.id)}
                                  disabled={deleteCommentSubmittingFor === c.id}
                                >
                                  {deleteCommentSubmittingFor === c.id ? "삭제 중..." : "삭제"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>

                        {Array.isArray(c.replies) && c.replies.length > 0 && (
                          <div className="space-y-3 pl-6">
                            {c.replies.map((r: CommentItem) => (
                              <div key={r.id} className="rounded-[12px] border border-[#E5E7EB] bg-white p-4">
                                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                                  <span>{r.authorName ?? "익명"}</span>

                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleLike(r.id)}
                                      className="text-xs font-semibold text-[#111827] hover:underline"
                                      aria-label="reply-like"
                                    >
                                      {r.likedByMe ? "❤️" : "🤍"} {r.likeCount ?? 0}
                                    </button>
                                    <span>{formatDateTime(r.createdAt)}</span>
                                  </div>
                                </div>

                                {editOpenFor === r.id ? (
                                  <div className="mt-3 space-y-2">
                                    <textarea
                                      value={editTextById[r.id] ?? ""}
                                      onChange={(e) =>
                                        setEditTextById((prev) => ({
                                          ...prev,
                                          [r.id]: e.target.value,
                                        }))
                                      }
                                      className="min-h-[84px] w-full resize-none rounded-[12px] border border-[#E5E7EB] p-3 text-sm outline-none focus:border-[#93C5FD]"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={closeEdit}
                                        className="h-10 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-sm font-semibold text-[#111827] hover:bg-[#F7F8FA]"
                                      >
                                        취소
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSubmitEdit(r.id)}
                                        disabled={editSubmittingFor === r.id || !(editTextById[r.id] ?? "").trim()}
                                        className="h-10 rounded-[12px] bg-[#111827] px-4 text-sm font-semibold text-white hover:bg-[#0B1220] disabled:opacity-50"
                                      >
                                        {editSubmittingFor === r.id ? "저장 중..." : "저장"}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-2 whitespace-pre-line text-sm text-[#1F2937]">{r.content}</div>
                                )}

                                {isMyComment(r) && editOpenFor !== r.id ? (
                                  <div className="mt-3 flex items-center gap-3">
                                    <button
                                      type="button"
                                      className="text-sm font-semibold text-[#111827] hover:underline"
                                      onClick={() => openEdit(r.id, r.content)}
                                    >
                                      수정
                                    </button>
                                    <button
                                      type="button"
                                      className="text-sm font-semibold text-[#B91C1C] hover:underline"
                                      onClick={() => setDeleteCommentOpenFor(r.id)}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                ) : null}

                                <AlertDialog
                                  open={deleteCommentOpenFor === r.id}
                                  onOpenChange={(open) => setDeleteCommentOpenFor(open ? r.id : null)}
                                >
                                  <AlertDialogContent className="rounded-[16px] border border-[#E5E7EB]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>댓글 삭제</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        삭제한 댓글은 복구할 수 없습니다. 정말 삭제하시겠어요?
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="rounded-[12px] border-[#E5E7EB]">취소</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="rounded-[12px] bg-[#EF4444] text-white hover:bg-[#DC2626]"
                                        onClick={() => handleDeleteComment(r.id)}
                                        disabled={deleteCommentSubmittingFor === r.id}
                                      >
                                        {deleteCommentSubmittingFor === r.id ? "삭제 중..." : "삭제"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/boards"
            className="flex h-12 items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
          >
            목록으로
          </Link>
        </div>
      </div>

      <AlertModal {...alertProps} />
    </section>
  );
}
