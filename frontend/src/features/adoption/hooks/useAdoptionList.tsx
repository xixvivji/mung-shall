import { useEffect, useMemo, useState } from "react";
import { fetchAdoptionList, fetchDogKinds, fetchSigunguList, fetchSidoList } from "../api/adoptionApi";
import DogGrid from "../components/DogGrid";
import Filters, { DEFAULT_BREED, DEFAULT_CITY, DEFAULT_PROVINCE } from "../components/Filters";
import Pagination from "../components/Pagination";
import type { AdoptionDog } from "../types";

export default function AdoptionList() {
  const [dogs, setDogs] = useState<AdoptionDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [sidoOptions, setSidoOptions] = useState<{ label: string; value: string }[]>([]);
  const [sigunguOptions, setSigunguOptions] = useState<{ label: string; value: string }[]>([]);
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

  const breedParam = filters.breed !== DEFAULT_BREED ? filters.breed : undefined;

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

  useEffect(() => {
    let cancelled = false;
    fetchSidoList()
      .then((list) => {
        if (cancelled) return;
        setSidoOptions(list.map((item) => ({ label: item.name, value: item.orgCd })));
      })
      .catch(() => {
        if (cancelled) return;
        setSidoOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (filters.province === DEFAULT_PROVINCE) {
      setSigunguOptions([]);
      return;
    }

    let cancelled = false;
    setSigunguOptions([]);
    fetchSigunguList(filters.province)
      .then((list) => {
        if (cancelled) return;
        setSigunguOptions(list.map((item) => ({ label: item.name, value: item.orgCd })));
      })
      .catch(() => {
        if (cancelled) return;
        setSigunguOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, [filters.province]);

  useEffect(() => {
    let cancelled = false;
    fetchDogKinds()
      .then((list) => {
        if (cancelled) return;
        setBreeds(list);
      })
      .catch(() => {
        if (cancelled) return;
        setBreeds([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-[#333]">Adoption</h1>
        <Filters
          breeds={breeds}
          provinces={sidoOptions}
          cities={sigunguOptions}
          onChange={(next) => {
            setFilters(next);
            setPage(0);
          }}
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
