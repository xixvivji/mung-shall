import { cn } from "@/shared/ui/utils";
import { resolveAdoptionTagColorClass } from "../utils/adoptionCardUi";

type AdoptionStatusTagProps = {
  label: string;
  className?: string;
};

export default function AdoptionStatusTag({
  label,
  className,
}: AdoptionStatusTagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center rounded-full px-3 text-xs font-semibold shadow-[0_6px_14px_rgba(15,23,42,0.16)]",
        resolveAdoptionTagColorClass(label),
        className
      )}
    >
      {label}
    </span>
  );
}
