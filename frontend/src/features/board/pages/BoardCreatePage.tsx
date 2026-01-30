import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import BoardForm from "../components/BoardForm";
import { createBoard, toBoardApiError } from "../api/boardApi";

export default function BoardCreatePage() {
  const navigate = useNavigate();
  const { openAlert, alertProps } = useAlertModal();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: { title: string; content: string; category?: string }) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await createBoard(values);
      if (result.id) {
        navigate(`/boards/${result.id}`);
      } else {
        navigate("/boards");
      }
    } catch (err) {
      const boardError = toBoardApiError(err);
      if (boardError.type === "unauthenticated") {
        openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      } else {
        openAlert({ title: "게시글 등록 실패", message: boardError.message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">홈 &gt; 게시판 &gt; 글쓰기</p>
          <h1 className="text-[32px] font-bold text-[#1F2937]">새 글 작성</h1>
        </div>

        <div className="mt-10 rounded-[16px] bg-white p-8 shadow-lg">
          <BoardForm
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="등록하기"
            cancelLabel="목록으로"
            onCancel={() => navigate("/boards")}
          />
        </div>
      </div>

      <AlertModal {...alertProps} />
    </section>
  );
}
