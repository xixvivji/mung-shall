import { useEffect, useMemo, useState } from "react";
import { fetchAdoptionList } from "../api/adoptionApi";
import DogGrid from "../components/DogGrid";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import type { AdoptionDog } from "../types";

export default function AdoptionList() {
  const [dogs, setDogs] = useState<AdoptionDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdoptionList()
      .then((items) => {
        if (!cancelled) {
          setDogs(items);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Failed to load";
          setError(message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const breeds = useMemo(
    () =>
      Array.from(
        new Set(
          dogs
            .map((dog) => dog.breed?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ),
    [dogs]
  );

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-[#333]">Adoption</h1>
        <Filters breeds={breeds} />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="text-sm text-[#777]">Loading...</div>
        ) : error ? (
          <div className="text-sm text-[#d14343]">{error}</div>
        ) : dogs.length === 0 ? (
          <div className="text-sm text-[#777]">No dogs found.</div>
        ) : (
          <DogGrid dogs={dogs} />
        )}
      </div>

      <div className="mt-10">
        <Pagination />
      </div>
    </section>
  );
}
