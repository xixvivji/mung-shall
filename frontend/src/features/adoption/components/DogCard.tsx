import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import type { AdoptionDog } from "../types";
import FavoriteHeart from "@/shared/components/FavoriteHeart";

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
};

export default function DogCard({
  dog,
  favoriteActive,
  favoriteDisabled,
  onToggleFavorite,
  variant = "link",
  selected = false,
  draggable = false,
  onDragStart,
  className = "",
}: DogCardProps) {
  const baseClass = [
    "group relative rounded-2xl border bg-white transition",
    selected ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]" : "border-[#eee] hover:border-[#ddd]",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="relative mb-3 w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-50">
        {dog.imageUrl ? (
          <img
            src={dog.imageUrl}
            alt={dog.name}
            className="h-full w-full object-contain object-center transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
            No image
          </div>
        )}
      </div>
      <div className="text-sm font-semibold">{dog.name}</div>
      <div className="text-xs text-[#666]">{dog.breed}</div>
      <div className="text-xs text-[#999]">{dog.age}</div>
    </>
  );

  const favoriteButton = (
    <FavoriteHeart active={favoriteActive} disabled={favoriteDisabled} onToggle={onToggleFavorite} />
  );

  // ✅ 기존 동작 유지: 입양 리스트에서 쓰는 Link 카드
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

  // ✅ SelectStep용: 이동 없는 div 카드 + draggable 지원
  return (
    <div className={baseClass} draggable={draggable} onDragStart={onDragStart}>
      <div className="p-4">{content}</div>
      {favoriteButton}
    </div>
  );
}
