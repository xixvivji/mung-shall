import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import { ROUTES } from "@/shared/constants/routes";
import useAuth from "@/features/auth/hooks/useAuth";
import { startAdoption } from "@/features/adoption/api/adoptionApi";
import useFavoriteDogs, { resolveFavoriteErrorMessage } from "@/features/adoption/hooks/useFavoriteDogs";

type Props = {
  dogId: string;
};

export default function ActionButtons({ dogId }: Props) {
  const { openAlert, alertProps } = useAlertModal();
  const { isFavorite, pendingIds, toggleFavorite } = useFavoriteDogs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isStarting, setIsStarting] = useState(false);

  const id = String(dogId);
  const liked = isFavorite(id);
  const pending = pendingIds.has(id);

  const label = liked ? "관심강아지 해제" : "관심강아지 등록";
  const pendingLabel = liked ? "관심강아지 해제 중..." : "관심강아지 등록 중...";

  const handleToggleLike = async () => {
    const result = await toggleFavorite(id);
    if (result.status === "unauthenticated") {
      openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      return;
    }
    if (result.status === "error") {
      openAlert({ title: "관심강아지 처리 실패", message: resolveFavoriteErrorMessage(result.error) });
    }
  };

  const handleStartAdoption = async () => {
    const numericDogId = Number(dogId);
    const resolvedUserId =
      typeof user?.userId === "number"
        ? user.userId
        : typeof (user as { id?: number } | null)?.id === "number"
          ? (user as { id?: number }).id
          : null;

    if (!Number.isFinite(numericDogId)) {
      openAlert({ title: "입양 신청 실패", message: "유효하지 않은 강아지 ID입니다." });
      return;
    }

    if (!user) {
      openAlert({ title: "로그인 필요", message: "입양을 진행하려면 로그인이 필요합니다." });
      navigate(ROUTES.login, { state: { from: location.pathname } });
      return;
    }

    if (typeof resolvedUserId !== "number" || !Number.isFinite(resolvedUserId)) {
      openAlert({ title: "입양 신청 실패", message: "유효하지 않은 사용자 정보입니다." });
      return;
    }

    if (isStarting) return;
    setIsStarting(true);
    try {
      const { adoptionId } = await startAdoption({
        userId: resolvedUserId,
        abandonedDogId: numericDogId,
      });
      navigate(`/adoptions/${adoptionId}`);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        openAlert({ title: "로그인 필요", message: "입양을 진행하려면 로그인이 필요합니다." });
        navigate(ROUTES.login, { state: { from: location.pathname } });
        return;
      }
      openAlert({ title: "입양 신청 실패", message: "입양 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." });
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        className="rounded-md bg-[#3182f6] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        onClick={handleStartAdoption}
        disabled={isStarting}
        aria-busy={isStarting}
      >
        {isStarting ? "처리 중..." : "입양하기"}
      </button>

      <Button
        type="button"
        variant="outline"
        className="border-[#ddd] bg-white text-[#333] hover:bg-[#f8f8f8] active:scale-[0.98]"
        onClick={handleToggleLike}
        disabled={pending}
        aria-pressed={liked}
        aria-busy={pending}
      >
        {pending ? pendingLabel : label}
      </Button>

      <AlertModal {...alertProps} />
    </div>
  );
}
