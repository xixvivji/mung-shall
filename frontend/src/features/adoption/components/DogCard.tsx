import type { AdoptionDog } from "../types";

type DogCardProps = {
  dog: AdoptionDog;
};

export default function DogCard({ dog }: DogCardProps) {
  return (
    <div className="rounded-lg border border-[#eee] bg-white p-4">
      <div className="text-sm font-semibold">{dog.name}</div>
      <div className="text-xs text-[#666]">{dog.breed}</div>
      <div className="text-xs text-[#999]">{dog.age}</div>
    </div>
  );
}
