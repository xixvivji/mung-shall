import type { MouseEventHandler } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/shared/ui/utils";

type FavoriteHeartProps = {
  active: boolean;
  onToggle: () => void;
  disabled?: boolean;
  floating?: boolean;
  className?: string;
};

export default function FavoriteHeart({
  active,
  onToggle,
  disabled = false,
  floating = true,
  className,
}: FavoriteHeartProps) {
  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled) return;
    onToggle();
  };

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "관심강아지 해제" : "관심강아지 등록"}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-transform duration-150 hover:scale-105 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
        floating ? "absolute right-3 top-3" : "relative",
        className
      )}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          active ? "fill-red-500 text-red-500" : "text-gray-400"
        )}
      />
    </button>
  );
}
