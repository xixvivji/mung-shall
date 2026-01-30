import { useCallback } from "react";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import DogCard from "./DogCard";
import type { AdoptionDog } from "../types";
import useFavoriteDogs, { resolveFavoriteErrorMessage } from "../hooks/useFavoriteDogs";

type DogGridProps = {
  dogs: AdoptionDog[];
};

export default function DogGrid({ dogs }: DogGridProps) {
  const { openAlert, alertProps } = useAlertModal();
  const { isFavorite, pendingIds, toggleFavorite } = useFavoriteDogs();

  const handleToggleFavorite = useCallback(
    async (dogId: string | number) => {
      const result = await toggleFavorite(dogId);
      if (result.status === "unauthenticated") {
        openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
        return;
      }
      if (result.status === "error") {
        openAlert({ title: "관심 등록 실패", message: resolveFavoriteErrorMessage(result.error) });
      }
    },
    [openAlert, toggleFavorite]
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dogs.map((dog) => {
          const id = String(dog.id);
          return (
            <DogCard
              key={dog.id}
              dog={dog}
              favoriteActive={isFavorite(id)}
              favoriteDisabled={pendingIds.has(id)}
              onToggleFavorite={() => handleToggleFavorite(id)}
            />
          );
        })}
      </div>
      <AlertModal {...alertProps} />
    </>
  );
}
