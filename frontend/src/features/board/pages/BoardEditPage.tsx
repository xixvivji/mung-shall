import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import BoardForm from "../components/BoardForm";
import { fetchBoardDetail, toBoardApiError, updateBoard } from "../api/boardApi";
import type { BoardCategory, BoardDetail } from "../types";

type BoardFormSubmitValues = {
  title: string;
  content: string;
  category?: BoardCategory;
  mediaUrls?: string[];
};

export default function BoardEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { openAlert, alertProps } = useAlertModal();

  const [detail, setDetail] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
          } else if (boardError.type === "forbidden") {
            openAlert({ title: "수정 불가", message: "수정 권한이 없습니다." });
          } else {
            openAlert({ title: "게시글 불러오기 실패", message: boardError.message });
          }
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });

    return () => {
      cancelled = true;
    };
  }, [id, openAlert]);

  const handleSubmit = async (values: BoardFormSubmitValues) => {
    if (!id || submitting) return;
    setSubmitting(true);

    try {
      await updateBoard(id, {
        title: values.title,
        content: values.content,
        category: values.category,
        mediaUrls: values.mediaUrls,
      });

      navigate(`/boards/${id}`);
    } catch (err) {
      const boardError = toBoardApiError(err);
      if (boardError.type === "unauthenticated") {
        openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      } else if (boardError.type === "forbidden") {
        openAlert({ title: "수정 불가", message: "수정 권한이 없습니다." });
      } else {
        openAlert({ title: "게시글 수정 실패", message: boardError.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <section className="bg-white">
        <div className="mx-auto max-w-[1440px] px-8 py-12">
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280]">홈 &gt; 게시판 &gt; 수정</p>
            <h1 className="text-[32px] font-bold text-[#1F2937]">게시글 수정</h1>
          </div>

          <div className="mt-10 rounded-[16px] bg-white p-8 shadow-lg">
            {loading ? (
                <div className="text-sm text-[#6B7280]">Loading...</div>
            ) : detail ? (
                <BoardForm
                    initialValues={{
                      title: detail.title,
                      content: detail.content,
                      category: detail.category,
                      mediaUrls: detail.mediaUrls ?? [],
                    }}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitLabel="수정하기"
                    cancelLabel="취소"
                    onCancel={() => navigate(`/boards/${id}`)}
                />
            ) : (
                <div className="text-sm text-[#d14343]">게시글을 불러올 수 없습니다.</div>
            )}
          </div>
        </div>

        <AlertModal {...alertProps} />
      </section>
  );
}
