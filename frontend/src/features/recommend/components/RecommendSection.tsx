import RecommendDogCard from "./RecommendDogCard";
import type { RecommendDog } from "../types";

type RecommendSectionProps = {
  items: RecommendDog[];
};

export default function RecommendSection({ items }: RecommendSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((dog) => (
        <RecommendDogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
}
