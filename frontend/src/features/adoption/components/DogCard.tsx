import type { DragEvent } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import type { AdoptionDog, AdoptionStatus, UserType } from "../types";
import FavoriteHeart from "@/shared/components/FavoriteHeart";
import useAuth from "@/features/auth/hooks/useAuth";
import { ImageWithFallback } from "@/shared/ui/figma/ImageWithFallback";
import { MapPin } from "lucide-react";

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

function resolveUserType(user: unknown): UserType {
  if (!user || typeof user !== "object") return "GUEST";

  const normalized = String(
    (user as { userType?: string; type?: string }).userType ??
      (user as { userType?: string; type?: string }).type ??
      ""
  ).toLowerCase();

  if (normalized === "shelter" || normalized === "center") return "SHELTER";
  return "GENERAL";
}

export function resolveAdoptionTagLabel(
  adoptionStatus: AdoptionStatus,
  userType: UserType
): string {
  if (userType === "GUEST") {
    if (
      adoptionStatus === "ADOPTING_BY_ME" ||
      adoptionStatus === "ADOPTING_BY_OTHERS"
    ) {
      return "입양 진행중";
    }
  }

  const map: Record<AdoptionStatus, string> = {
    NOT_ADOPTED: "입양 가능",
    ADOPTING_BY_ME: "입양 진행중",
    ADOPTING_BY_OTHERS: "다른 입양자 진행중",
    ADOPTED: "입양 완료",
  };

  return map[adoptionStatus];
}

function resolveAdoptionTagColor(
  adoptionStatus: AdoptionStatus,
  userType: UserType
): string {
  if (adoptionStatus === "NOT_ADOPTED") return "bg-emerald-500 text-white";
  if (adoptionStatus === "ADOPTED") return "bg-gray-500 text-white";
  if (adoptionStatus === "ADOPTING_BY_OTHERS" && userType !== "GUEST") {
    return "bg-orange-500 text-white";
  }
  return "bg-blue-500 text-white";
}

type AdoptionStatusTagProps = {
  label: string;
  colorClassName: string;
};

function AdoptionStatusTag({ label, colorClassName }: AdoptionStatusTagProps) {
  return (
    <span
      className={[
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold whitespace-nowrap",
        "shadow-[0_6px_16px_rgba(0,0,0,0.12)]",
        colorClassName,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

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
  const userType = resolveUserType(user);

  const tagLabel = resolveAdoptionTagLabel(dog.adoptionStatus, userType);
  const tagColorClass = resolveAdoptionTagColor(dog.adoptionStatus, userType);

  const showHeart =
    showFavoriteButton &&
    userType === "GENERAL" &&
    dog.adoptionStatus === "NOT_ADOPTED";

  const baseClass = [
    "group relative rounded-2xl border bg-white transition",
    selected ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]" : "border-[#eee] hover:border-[#ddd]",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const breedText = dog.breed ?? "-";
  const ageText = dog.age ?? "-";
  const careText =
    (dog as { careNm?: string; careName?: string; shelterName?: string; location?: string }).careNm ??
    (dog as { careNm?: string; careName?: string; shelterName?: string; location?: string }).careName ??
    (dog as { careNm?: string; careName?: string; shelterName?: string; location?: string }).shelterName ??
    (dog as { careNm?: string; careName?: string; shelterName?: string; location?: string }).location ??
    "-";

  const content = (
    <>
      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-50">
        <div className="overlay pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between">
          <div className="left-slot pointer-events-auto flex h-10 w-10 items-center justify-center">
            {showHeart ? (
              <FavoriteHeart
                active={favoriteActive}
                disabled={favoriteDisabled}
                onToggle={onToggleFavorite}
                floating={false}
              />
            ) : null}
          </div>

          <div className="right-slot pointer-events-auto flex min-h-10 items-center justify-end">
            <AdoptionStatusTag label={tagLabel} colorClassName={tagColorClass} />
          </div>
        </div>

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
        <Link className="block h-full w-full p-4" to={ROUTES.adoptionDetail(dog.id)}>
          {content}
        </Link>
      </div>
    );
  }

  return (
    <div className={baseClass} draggable={draggable} onDragStart={onDragStart}>
      <div className="p-4">{content}</div>
    </div>
  );
}
