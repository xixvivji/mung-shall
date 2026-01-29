import { useEffect, useState } from "react";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { ApiError } from "@/shared/api/client";
import useAuth from "@/features/auth/hooks/useAuth";
import { getLikedDogs, likeDog, unlikeDog } from "@/features/adoption/api/likeApi";

type Props = {
  dogId: string;
};

const DEFAULT_ERROR_MESSAGE = "??? ??????. ?? ? ?? ??????.";

function resolveErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return "???? ?????.";
    if (err.status === 404) return "??? ??? ?? ? ????.";
    if (err.status >= 500) return DEFAULT_ERROR_MESSAGE;
    const raw = err.message?.trim();
    return raw || DEFAULT_ERROR_MESSAGE;
  }
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}

export default function ActionButtons({ dogId }: Props) {
  const { user } = useAuth();
  const { openAlert, alertProps } = useAlertModal();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!user) {
      setLiked(null);
      return () => {
        mounted = false;
      };
    }
    getLikedDogs()
      .then((list) => {
        if (!mounted) return;
        const isLiked = list.some((dog) => String(dog.dogId) === String(dogId));
        setLiked(isLiked);
      })
      .catch(() => {
        if (!mounted) return;
        setLiked(null);
      });
    return () => {
      mounted = false;
    };
  }, [dogId, user]);

  const handleToggleLike = async () => {
    if (!user) {
      openAlert({ title: "??? ??", message: "???? ?????." });
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await unlikeDog(dogId);
        setLiked(false);
      } else {
        await likeDog(dogId);
        setLiked(true);
      }
    } catch (err) {
      openAlert({ title: "?? ??", message: resolveErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button className="rounded-md bg-[#3182f6] px-5 py-2 text-sm font-semibold text-white">
        ?? ??
      </button>
      <button
        type="button"
        className="rounded-md border border-[#ddd] px-5 py-2 text-sm text-[#333] disabled:opacity-50"
        onClick={handleToggleLike}
        disabled={loading}
      >
        {liked ? "? ??" : "???"}
      </button>

      <AlertModal {...alertProps} />
    </div>
  );
}
