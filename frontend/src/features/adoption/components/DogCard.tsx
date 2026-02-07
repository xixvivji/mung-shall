import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import type { AdoptionDog } from "../types";
import FavoriteHeart from "@/shared/components/FavoriteHeart";
import useAuth from "@/features/auth/hooks/useAuth";
import { ImageWithFallback } from "@/shared/ui/figma/ImageWithFallback";
import { MapPin } from "lucide-react";

type DogCardProps = {
  dog: AdoptionDog;

  /** 기본은 기존처럼 상세 페이지로 이동하는 Link 카드 */
  variant?: "link" | "div";

  /** SelectStep 등에서 선택 강조 */
  selected?: boolean;

  /** SelectStep 등에서 드래그 가능 */
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;

  /** 외부에서 추가 클래스 주입 */
  className?: string;

  /** 관심 등록 버튼 */
  favoriteActive: boolean;
  favoriteDisabled?: boolean;
  onToggleFavorite: () => void;
  showFavoriteButton?: boolean;
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
  const normalizedUserType = String(
    user?.userType ?? (user as { type?: string } | null)?.type ?? ""
  ).toLowerCase();
  const isShelter = normalizedUserType === "shelter";

  const baseClass = [
    "group relative rounded-2xl border bg-white transition",
    selected ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]" : "border-[#eee] hover:border-[#ddd]",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // ✅ 관심등록 카드와 동일한 텍스트 배치: 품종 / (품종·나이) / (MapPin+보호소)
  const breedText = dog.breed ?? "-";
  const ageText = dog.age ?? "-";
  const careText =
    // 타입에 따라 필드명이 다를 수 있어 안전하게 fallback
    (dog as any).careNm ??
    (dog as any).careName ??
    (dog as any).shelterName ??
    (dog as any).location ??
    "-";

  const content = (
    <>
      <div className="relative mb-3 w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
        {dog.adopting === true && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            입양 진행 중
          </span>
        )}

        {dog.imageUrl ? (
          <>
            <ImageWithFallback
              src={dog.imageUrl}
              alt={breedText}
              className="absolute inset-0 h-full w-full object-cover scale-[1.05] blur-[10px] brightness-90 transition duration-500"
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

      {/* 1) 품종 */}
      <div className="text-sm font-medium text-gray-900">{breedText}</div>

      {/* 2) 품종 · 나이(년생) */}
      <div className="text-sm text-gray-500">
        {breedText} · {ageText}
      </div>

      {/* 3) 위치/보호소 */}
      <div className="flex items-center gap-1 text-sm text-gray-400">
        <MapPin className="h-4 w-4" />
        <span>{dog.careNm ?? "-"}</span>
      </div>
    </>
  );

  const favoriteButton = user && showFavoriteButton && !isShelter ? (
    <FavoriteHeart
      active={favoriteActive}
      disabled={favoriteDisabled}
      onToggle={onToggleFavorite}
    />
  ) : null;

  if (variant === "link") {
    return (
      <div className={baseClass}>
        <Link className="block h-full w-full p-4" to={ROUTES.adoptionDetail(dog.id)}>
          {content}
        </Link>
        {favoriteButton}
      </div>
    );
  }

  return (
    <div className={baseClass} draggable={draggable} onDragStart={onDragStart}>
      <div className="p-4">{content}</div>
      {favoriteButton}
    </div>
  );
}
