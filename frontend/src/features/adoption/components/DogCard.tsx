import type { DragEvent } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import useAuth from "@/features/auth/hooks/useAuth";
import FavoriteHeart from "@/shared/components/FavoriteHeart";
import { ImageWithFallback } from "@/shared/ui/figma/ImageWithFallback";
import type { AdoptionDog } from "../types";
import AdoptionStatusTag from "./AdoptionStatusTag";
import {
  resolveAdoptionStatus,
  resolveAdoptionTagLabel,
  resolveUserType,
  shouldShowHeartButton,
} from "../utils/adoptionCardUi";

type DogCardProps = {
  dog: AdoptionDog;
  variant?: "link" | "div";
  selected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  className?: string;
  favoriteActive: boolean;
  favoriteDisabled?: boolean;
  onToggleFavorite: () => void;
  showFavoriteButton?: boolean;
};

type DogLocationLike = {
  careNm?: string;
  careName?: string;
  shelterName?: string;
  location?: string;
};

export default function DogCard({
  dog,
  favoriteActive,
  favoriteDisabled,
  onToggleFavorite,
  showFavoriteButton = true,
  variant = "link",
  selected = false,
  draggable = false,
  onDragStart,
  className = "",
}: DogCardProps) {
  const { user } = useAuth();
  const userType = resolveUserType(user as { userType?: unknown; type?: unknown } | null | undefined);
  const adoptionStatus = resolveAdoptionStatus({
    adoptionStatus: dog.adoptionStatus,
    adopting: dog.adopting,
    processState: dog.processState,
  });
  const adoptionTagLabel = resolveAdoptionTagLabel(adoptionStatus, userType);
  const showHeart = showFavoriteButton && shouldShowHeartButton(adoptionStatus, userType);

  const baseClass = [
    "group relative rounded-2xl border bg-white transition",
    selected ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]" : "border-[#eee] hover:border-[#ddd]",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const locationDog = dog as DogLocationLike;
  const breedText = dog.breed ?? "-";
  const ageText = dog.age ?? "-";
  const careText = locationDog.careNm ?? locationDog.careName ?? locationDog.shelterName ?? locationDog.location ?? "-";

  const overlay = (
    <div className="pointer-events-none absolute left-4 right-4 top-4 z-20 flex items-start justify-between">
      <div className="left-slot flex h-10 w-10 shrink-0 items-center justify-center">
        {showHeart ? (
          <FavoriteHeart
            active={favoriteActive}
            disabled={favoriteDisabled}
            onToggle={onToggleFavorite}
            className="pointer-events-auto !static !right-auto !top-auto"
          />
        ) : null}
      </div>

      <div className="right-slot shrink-0">
        <AdoptionStatusTag label={adoptionTagLabel} />
      </div>
    </div>
  );

  const content = (
    <>
      <div className="relative mb-3 w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
        {dog.imageUrl ? (
          <>
            <ImageWithFallback
              src={dog.imageUrl}
              alt={breedText}
              className="absolute inset-0 h-full w-full scale-[1.05] object-cover blur-[10px] brightness-90 transition duration-500"
              aria-hidden
            />
            <div className="relative z-10 h-full w-full">
              <ImageWithFallback
                src={dog.imageUrl}
                alt={breedText}
                className="h-full w-full object-contain object-center transition-transform duration-200 ease-out group-hover:scale-[1.02]"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="text-sm font-medium text-gray-900">{breedText}</div>

      <div className="text-sm text-gray-500">
        {breedText} · {ageText}
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-400">
        <MapPin className="h-4 w-4" />
        <span>{careText}</span>
      </div>
    </>
  );

  if (variant === "link") {
    return (
      <div className={baseClass}>
        {overlay}
        <Link className="block h-full w-full p-4" to={ROUTES.adoptionDetail(dog.id)}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className={baseClass} draggable={draggable} onDragStart={onDragStart}>
      {overlay}
      <div className="p-4">{content}</div>
    </div>
  );
}
