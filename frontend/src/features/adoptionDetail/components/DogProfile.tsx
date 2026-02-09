import type { AdoptionDetail } from "../types";

type DogProfileProps = {
  detail: AdoptionDetail;
};

export default function DogProfile({ detail }: DogProfileProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{detail.name}</h2>
      <p className="text-sm text-[#666]">{detail.breed}</p>
      <p className="mt-4 text-sm text-[#444]">{detail.description}</p>
    </div>
  );
}
