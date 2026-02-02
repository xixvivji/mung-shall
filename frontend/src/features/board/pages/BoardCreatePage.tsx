import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import BoardForm from "../components/BoardForm";
import { createBoard, toBoardApiError } from "../api/boardApi";
import { authStore } from "@/features/auth/store/authStore";

type BoardCategory = "FREE" | "REVIEW";

function parseCategory(param: string | null): BoardCategory {
  const v = (param ?? "FREE").toUpperCase();
  return v === "REVIEW" ? "REVIEW" : "FREE";
}

export default function BoardCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openAlert, alertProps } = useAlertModal();
  const [submitting, setSubmitting] = useState(false);

  const me = authStore.getSnapshot();

  const fixedCategory = useMemo(() => {
    return parseCategory(searchParams.get("category"));
  }, [searchParams]);

  useEffect(() => {
    if (fixedCategory !== "REVIEW") return;

    if (!me) {
      openAlert({
        title: "로그인 필요",
        message: "후기 게시글 작성은 로그인 후 가능합니다.",
      });
      navigate("/auth/login", { replace: true });
      return;
    }

    if (me.userType !== "adopter") {
      openAlert({
        title: "작성 권한 없음",
        message: "후기 게시글은 입양자 계정만 작성할 수 있습니다.",
      });
      navigate("/boards?category=REVIEW", { replace: true });
    }
  }, [fixedCategory, me, navigate, openAlert]);

  const handleSubmit = async (values: { title: string; content: string; category?: string }) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const payload = {
        ...values,
        category: fixedCategory,
      };

      const result = await createBoard(payload);

      if (result.id) {
        navigate(`/boards/${result.id}`);
      } else {
        navigate(`/boards?category=${fixedCategory}`);
      }
    } catch (err) {
      const boardError = toBoardApiError(err);

      if (boardError.type === "unauthenticated") {
        openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      } else if (boardError.type === "forbidden") {
        openAlert({
          title: "작성 권한 없음",
          message:
              fixedCategory === "REVIEW"
                  ? "입양 완료자만 후기 게시글을 작성할 수 있습니다."
                  : "권한이 없습니다.",
        });
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

            <h1 className="text-[32px] font-bold text-[#1F2937]">
              {fixedCategory === "REVIEW" ? "후기 글 작성" : "새 글 작성"}
            </h1>

            <p className="text-sm text-[#6B7280]">
              작성 게시판:{" "}
              <span className="font-semibold text-[#111827]">
              {fixedCategory === "REVIEW" ? "후기(REVIEW)" : "자유(FREE)"}
            </span>
            </p>
          </div>

          <div className="mt-10 rounded-[16px] bg-white p-8 shadow-lg">
            <BoardForm
                onSubmit={handleSubmit}
                submitting={submitting}
                submitLabel="등록하기"
                cancelLabel="목록으로"
                onCancel={() => navigate(`/boards?category=${fixedCategory}`)}
                showCategory={false}
            />
          </div>
        </div>

        <AlertModal {...alertProps} />
      </section>
  );
}
