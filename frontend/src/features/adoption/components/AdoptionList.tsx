import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchAdoptionList } from "../api/adoptionApi";
import type { AdoptionDog } from "../types";
import DogGrid from "./DogGrid";
import Filters, { DEFAULT_BREED, DEFAULT_CITY, DEFAULT_PROVINCE } from "./Filters";
import Pagination from "./Pagination";

export default function AdoptionList() {
  const [dogs, setDogs] = useState<AdoptionDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const parsePageParam = useCallback((params: URLSearchParams) => {
    const raw = params.get("page");
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value < 1) return 1;
    return Math.floor(value);
  }, []);
  const [page, setPage] = useState(() => Math.max(parsePageParam(searchParams) - 1, 0));
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    breed: DEFAULT_BREED,
    province: DEFAULT_PROVINCE,
    city: DEFAULT_CITY,
  });
  const filtersRef = useRef(filters);

  const region = useMemo(() => {
    if (filters.city !== DEFAULT_CITY) return filters.city;
    if (filters.province !== DEFAULT_PROVINCE) return filters.province;
    return undefined;
  }, [filters.city, filters.province]);

  const breedParam = filters.breed !== DEFAULT_BREED ? filters.breed : undefined;
  const handleFilterChange = useCallback((next: { breed: string; province: string; city: string }) => {
    const current = filtersRef.current;
    const isSame =
      current.breed === next.breed &&
      current.province === next.province &&
      current.city === next.city;
    if (isSame) return;
    setFilters(next);
    setPage(0);
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    const nextPage = Math.max(parsePageParam(searchParams) - 1, 0);
    if (nextPage !== page) {
      setPage(nextPage);
    }
  }, [page, parsePageParam, searchParams]);

  useEffect(() => {
    const currentParam = parsePageParam(searchParams);
    const desiredParam = page + 1;
    if (currentParam === desiredParam) return;

    const next = new URLSearchParams(searchParams);
    next.set("page", String(desiredParam));
    setSearchParams(next, { replace: true });
  }, [page, parsePageParam, searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAdoptionList({
      page,
      size: 12,
      sort: "happenDt",
      region,
      breed: breedParam,
    })
      .then((result) => {
        if (!cancelled) {
          setDogs(result.items);
          setTotalPages(result.totalPages || 1);
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
  }, [page, region, breedParam]);

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
        <Filters
          breeds={breeds}
          onChange={handleFilterChange}
        />
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
          currentPage={page + 1}
          totalPages={totalPages}
          onPrev={() => setPage((prev) => Math.max(prev - 1, 0))}
          onNext={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
        />
      </div>
    </section>
  );
}
