import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import BoardForm from "../components/BoardForm";
import { createBoard, toBoardApiError } from "../api/boardApi";
import { authStore } from "@/features/auth/store/authStore";
import type { BoardCategory } from "../types";

// ✅ 멍쉘 PNG import (경로는 네 프로젝트 기준으로 맞춰줘)
import mungshallWrite from "@/assets/images/게시글작성.png";

function parseInitialCategory(param: string | null): BoardCategory {
  const v = (param ?? "").toUpperCase();
  return v === "REVIEW" ? "REVIEW" : "FREE";
}

export default function BoardCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openAlert, alertProps } = useAlertModal();
  const [submitting, setSubmitting] = useState(false);

  const [me, setMe] = useState(() => authStore.getSnapshot());
  useEffect(() => authStore.subscribe(() => setMe(authStore.getSnapshot())), []);

  const initialCategory = useMemo(() => {
    return parseInitialCategory(searchParams.get("category"));
  }, [searchParams]);

  const handleSubmit = useCallback(
    async (values: { title: string; content: string; category?: BoardCategory; mediaUrls?: string[] }) => {
      if (submitting) return;
      setSubmitting(true);

      try {
        const selectedCategory: BoardCategory =
          String(values.category ?? initialCategory).toUpperCase() === "REVIEW" ? "REVIEW" : "FREE";

        if (selectedCategory === "REVIEW") {
          if (!me) {
            openAlert({ title: "로그인 필요", message: "후기 게시글 작성은 로그인 후 가능합니다." });
            navigate("/auth/login", { replace: true });
            return;
          }
          if (String(me.userType ?? "").toUpperCase() !== "ADOPTER") {
            openAlert({ title: "작성 권한 없음", message: "입양 완료자만 후기 게시글을 작성할 수 있습니다." });
            return;
          }
        }

        const payload = {
          title: values.title,
          content: values.content,
          category: selectedCategory,
          mediaUrls: values.mediaUrls ?? undefined,
        };

        const result = await createBoard(payload);

        if (result.id) navigate(`/boards/${result.id}`);
        else navigate(`/boards?category=${selectedCategory}`);
      } catch (err) {
        const boardError = toBoardApiError(err);

        if (boardError.type === "unauthenticated") {
          openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
        } else if (boardError.type === "forbidden") {
          openAlert({
            title: "작성 권한 없음",
            message: "후기 게시글은 입양 완료자만 작성할 수 있습니다.",
          });
        } else {
          openAlert({ title: "게시글 등록 실패", message: boardError.message });
        }
      } finally {
        setSubmitting(false);
      }
    },
    [initialCategory, me, navigate, openAlert, submitting]
  );

  return (
    <section className="bg-[#F7F8FA]">
      <div className="mx-auto max-w-[1440px] px-8 py-12">
        <div className="space-y-3">
          <p className="text-sm text-[#6B7280]">홈 &gt; 게시판 &gt; 글쓰기</p>
          <h1 className="text-[32px] font-bold text-[#1F2937]">새 글 작성</h1>
          <p className="text-sm text-[#6B7280]">카테고리를 선택하고 글을 작성해주세요.</p>
        </div>

        {/* ✅ 카드 래퍼를 relative로 만들고 멍쉘을 absolute로 올림 */}
        <div className="relative mt-45 rounded-[16px] bg-white p-8 shadow-lg">
          {/* ✅ 멍쉘: md 이상에서만 보이게(원하면 hidden 조건 제거) */}
          <img
            src={mungshallWrite}
            alt="멍쉘"
            className="
              pointer-events-none
              absolute
              left-[-133px]
              top-[-183px]
              z-10
              hidden md:block
              w-[400px]
              h-auto
              select-none
            "
            draggable={false}
          />

          <BoardForm
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="등록하기"
            cancelLabel="목록으로"
            onCancel={() => navigate(`/boards`)}
            showCategory={true}
            initialCategory={initialCategory}
            me={me}
          />
        </div>
      </div>

      <AlertModal {...alertProps} />
    </section>
  );
}
