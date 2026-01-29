import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import type { AdoptionDog } from "../types";

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
};

export default function DogCard({
  dog,
  variant = "link",
  selected = false,
  draggable = false,
  onDragStart,
  className = "",
}: DogCardProps) {
  const baseClass = [
    "rounded-lg border bg-white p-4 transition",
    selected ? "border-[#5f7cf7] ring-2 ring-[#5f7cf7]" : "border-[#eee] hover:border-[#ddd]",
    draggable ? "cursor-grab active:cursor-grabbing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className="mb-3 overflow-hidden rounded-md bg-[#f7f7f7]">
        <img
          src={dog.imageUrl || imgFallback}
          alt={dog.name}
          className="h-40 w-full object-cover"
        />
      </div>
      <div className="text-sm font-semibold">{dog.name}</div>
      <div className="text-xs text-[#666]">{dog.breed}</div>
      <div className="text-xs text-[#999]">{dog.age}</div>
    </>
  );

  // ✅ 기존 동작 유지: 입양 리스트에서 쓰는 Link 카드
  if (variant === "link") {
    return (
      <Link className={baseClass} to={ROUTES.adoptionDetail(dog.id)}>
        {content}
      </Link>
    );
  }

  // ✅ SelectStep용: 이동 없는 div 카드 + draggable 지원
  return (
    <div className={baseClass} draggable={draggable} onDragStart={onDragStart}>
      {content}
    </div>
  );
}
