import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";
import { Link } from "react-router-dom";
import { ROUTES } from "@/shared/constants/routes";
import type { AdoptionDog } from "../types";

type DogCardProps = {
  dog: AdoptionDog;
};

export default function DogCard({ dog }: DogCardProps) {
  return (
    <Link
      className="rounded-lg border border-[#eee] bg-white p-4 transition hover:border-[#ddd]"
      to={ROUTES.adoptionDetail(dog.id)}
    >
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
    </Link>
  );
}
