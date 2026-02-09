import type { RecommendDog } from "../types";

type RecommendDogCardProps = {
  dog: RecommendDog;
};

export default function RecommendDogCard({ dog }: RecommendDogCardProps) {
  return (
    <div className="rounded-lg border border-[#eee] bg-white p-4">
      <div className="text-sm font-semibold">{dog.name}</div>
      <p className="mt-2 text-xs text-[#666]">{dog.description}</p>
    </div>
  );
}
