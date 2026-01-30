import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { Button } from "@/shared/ui/button";
import useFavoriteDogs, { resolveFavoriteErrorMessage } from "@/features/adoption/hooks/useFavoriteDogs";

type Props = {
  dogId: string;
};

export default function ActionButtons({ dogId }: Props) {
  const { openAlert, alertProps } = useAlertModal();
  const { isFavorite, pendingIds, toggleFavorite } = useFavoriteDogs();

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
      openAlert({ title: "관심 등록 실패", message: resolveFavoriteErrorMessage(result.error) });
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-md bg-[#3182f6] px-5 py-2 text-sm font-semibold text-white">
        ?? ??
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
