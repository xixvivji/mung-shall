import { useCallback, useEffect, useState } from "react";
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
import { createBoardComment, fetchBoardComments } from "../api/commentApi";
import type { CommentItem } from "../api/commentApi";

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
      const data = await fetchBoardComments(id);
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
      openAlert({ title: "댓글 작성 실패", message: "로그인이 필요하거나 요청이 실패했습니다." });
    } finally {
      setCommentSubmitting(false);
    }
  }, [commentSubmitting, commentText, id, loadComments, openAlert]);


  return (
    <section className="bg-[#F7F8FA]">
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
                {/* 게시글 제목/메타 */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-[#1F2937]">
                    {detail.title}
                  </h2>
                  <div className="text-sm text-[#6B7280]">
                    {detail.authorName} · {detail.createdAt}
                    {detail.updatedAt ? ` · 수정 ${detail.updatedAt}` : ""}
                  </div>
                </div>

                {/* 게시글 본문 */}
                <div className="whitespace-pre-line text-sm leading-7 text-[#1F2937]">
                  {detail.content}
                </div>

                <div className="mt-8 border-t border-[#E5E7EB] pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#1F2937]">댓글</h3>
                    <span className="text-sm text-[#6B7280]">
            {comments.length}개
          </span>
                  </div>

                  {/* 댓글 작성 */}
                  <div className="mt-4 flex flex-col gap-3">
          <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 입력하세요."
              className="min-h-[96px] w-full resize-none rounded-[12px] border border-[#E5E7EB] p-4 text-sm outline-none focus:border-[#93C5FD]"
          />
                    <div className="flex justify-end">
                      <button
                          type="button"
                          onClick={handleSubmitComment}
                          disabled={commentSubmitting || !commentText.trim()}
                          className="h-11 rounded-[12px] bg-[#2563EB] px-5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
                      >
                        {commentSubmitting ? "등록 중..." : "댓글 등록"}
                      </button>
                    </div>
                  </div>

                  {/* 댓글 목록 */}
                  <div className="mt-6 space-y-4">
                    {commentLoading ? (
                        <div className="text-sm text-[#6B7280]">
                          댓글 불러오는 중...
                        </div>
                    ) : commentError ? (
                        <div className="text-sm text-[#d14343]">
                          {commentError}
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-sm text-[#6B7280]">
                          첫 댓글을 남겨보세요.
                        </div>
                    ) : (
                        comments.map((c) => (
                            <div
                                key={c.id}
                                className="rounded-[12px] border border-[#E5E7EB] p-4"
                            >
                              <div className="flex items-center justify-between text-xs text-[#6B7280]">
                                <span>{c.authorName ?? "익명"}</span>
                                <span>{c.createdAt ?? ""}</span>
                              </div>
                              <div className="mt-2 whitespace-pre-line text-sm text-[#1F2937]">
                                {c.content}
                              </div>
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
            className="h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
          >
            목록으로
          </Link>
          <Link
            to={`/boards/${id}/edit`}
            className="h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
          >
            수정
          </Link>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <button
              type="button"
              className="h-12 rounded-[12px] border border-[#FCA5A5] bg-white px-6 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEF2F2]"
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
                <AlertDialogCancel className="rounded-[12px] border-[#E5E7EB]">
                  취소
                </AlertDialogCancel>
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
      </div>

      <AlertModal {...alertProps} />
    </section>
  );
}
