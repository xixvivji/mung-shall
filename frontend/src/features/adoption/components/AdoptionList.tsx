import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAdoptionList } from "../api/adoptionApi";
import type { AdoptionDog } from "../types";
import DogGrid from "./DogGrid";
import Filters, { DEFAULT_BREED, DEFAULT_CITY, DEFAULT_PROVINCE } from "./Filters";
import Pagination from "./Pagination";

function parsePage1(params: URLSearchParams) {
  const raw = params.get("page");
  const value = Number(raw);
  if (!raw || Number.isNaN(value) || value < 1) return 1; // URL은 1-based
  return Math.floor(value);
}

export default function AdoptionList() {
  const [dogs, setDogs] = useState<AdoptionDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ URL이 단일 진실(1-based)
  const currentPage1 = useMemo(() => parsePage1(searchParams), [searchParams]);
  // ✅ API는 0-based
  const page0 = currentPage1 - 1;

  const [filters, setFilters] = useState({
    breed: DEFAULT_BREED,
    province: DEFAULT_PROVINCE,
    city: DEFAULT_CITY,
  });

  const region = useMemo(() => {
    if (filters.city !== DEFAULT_CITY) return filters.city;
    if (filters.province !== DEFAULT_PROVINCE) return filters.province;
    return undefined;
  }, [filters.city, filters.province]);

  const breedParam = useMemo(
    () => (filters.breed !== DEFAULT_BREED ? filters.breed : undefined),
    [filters.breed]
  );

  const goToPage1 = useCallback(
    (nextPage1: number) => {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(nextPage1));
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const handleFilterChange = useCallback(
    (next: { breed: string; province: string; city: string }) => {
      setFilters(next);
      goToPage1(1); // ✅ 필터 바뀌면 1페이지로
    },
    [goToPage1]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdoptionList({
      page: page0,
      size: 12,
      sort: "happenDt",
      region,
      breed: breedParam,
    })
      .then((result) => {
        if (cancelled) return;
        setDogs(result.items);
        setTotalPages(result.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load";
        setError(message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page0, region, breedParam]);

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
        <Filters breeds={breeds} onChange={handleFilterChange} />
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
        <Pagination
          currentPage={currentPage1}
          totalPages={totalPages}
          onPrev={() => goToPage1(Math.max(currentPage1 - 1, 1))}
          onNext={() => goToPage1(Math.min(currentPage1 + 1, totalPages))}
        />
      </div>
    </section>
  );
}
