import DogCard from "./DogCard";
import type { AdoptionDog } from "../types";

type DogGridProps = {
  dogs: AdoptionDog[];
};

export default function DogGrid({ dogs }: DogGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
}
