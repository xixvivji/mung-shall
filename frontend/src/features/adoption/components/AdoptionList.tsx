import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    fetchAdoptionList,
    fetchDogKinds,
    fetchSigunguList,
    fetchSidoList,
} from "../api/adoptionApi";
import type { AdoptionDog } from "../types";
import DogGrid from "./DogGrid";
import Filters, {
    DEFAULT_CITY,
    DEFAULT_KIND,
    DEFAULT_PROVINCE,
    DEFAULT_STATUS,
} from "./Filters";
import Pagination from "./Pagination";
import adoptionImg from "@/assets/images/adoption.png";

function parsePage1(params: URLSearchParams) {
    const raw = params.get("page");
    const value = Number(raw);
    if (!raw || Number.isNaN(value) || value < 1) return 1;
    return Math.floor(value);
}

export default function AdoptionList() {
    const [dogs, setDogs] = useState<AdoptionDog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [breeds, setBreeds] = useState<string[]>([]);
    const lastFetchKeyRef = useRef<string>("");

    const [searchParams, setSearchParams] = useSearchParams();
    const [sidoOptions, setSidoOptions] = useState<{ label: string; value: string }[]>([]);
    const [sigunguOptions, setSigunguOptions] = useState<{ label: string; value: string }[]>([]);

    const currentPage1 = useMemo(() => parsePage1(searchParams), [searchParams]);
    const page0 = currentPage1 - 1;

    const [filters, setFilters] = useState({
        kind: DEFAULT_KIND,
        province: DEFAULT_PROVINCE,
        provinceLabel: DEFAULT_PROVINCE,
        city: DEFAULT_CITY,
        cityLabel: DEFAULT_CITY,
        status: DEFAULT_STATUS,
    });

    const region = useMemo(() => {
        if (filters.city !== DEFAULT_CITY) return filters.cityLabel;
        if (filters.province !== DEFAULT_PROVINCE) return filters.provinceLabel;
        return undefined;
    }, [filters.city, filters.province, filters.cityLabel, filters.provinceLabel]);

    const kindParam = useMemo(
        () => (filters.kind !== DEFAULT_KIND ? filters.kind : undefined),
        [filters.kind]
    );

    const PROCESS_STATE_MAP: Record<string, string> = {
        보호중: "보호중",
        공고중: "공고중",
        종료: "종료",
        입양중: "보호중",
        입양완료: "종료",
        반환: "종료",
        자연사: "종료",
    };

    const statusParam = useMemo(() => {
        if (filters.status === DEFAULT_STATUS) return undefined;
        return PROCESS_STATE_MAP[filters.status] ?? undefined;
    }, [filters.status]);

    const goToPage1 = useCallback(
        (nextPage1: number) => {
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("page", String(nextPage1));
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const handleFilterChange = useCallback(
        (next: {
            kind: string;
            province: string;
            city: string;
            provinceLabel: string;
            cityLabel: string;
            status: string;
        }) => {
            setFilters((prev) => {
                const isSame =
                    prev.kind === next.kind &&
                    prev.province === next.province &&
                    prev.city === next.city &&
                    prev.provinceLabel === next.provinceLabel &&
                    prev.cityLabel === next.cityLabel &&
                    prev.status === next.status;
                if (isSame) return prev;
                goToPage1(1);
                return next;
            });
        },
        [goToPage1]
    );

    useEffect(() => {
        let cancelled = false;
        const fetchKey = JSON.stringify({ page0, region, kindParam, statusParam });
        if (fetchKey === lastFetchKeyRef.current) return undefined;
        lastFetchKeyRef.current = fetchKey;

        setLoading(true);
        setError(null);

        fetchAdoptionList({
            page: page0,
            size: 12,
            region,
            kindNm: kindParam,
            processState: statusParam,
        })
            .then((result) => {
                if (cancelled) return;
                setDogs(result.items);
                setTotalPages(result.totalPages || 1);
            })
            .catch((err) => {
                if (cancelled) return;
                if (err instanceof DOMException && err.name === "AbortError") return;
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
    }, [page0, region, kindParam, statusParam]);

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
        <section className="mx-auto max-w-[1200px] px-6 py-20">
            <p className="text-sm text-[#6B7280]">홈 &gt; 입양하기</p>

            <div className="flex items-center justify-between gap-4">
                <h1 className="text-[33px] font-bold tracking-tight text-[#333]">입양하기</h1>

                <Filters
                    breeds={breeds}
                    provinces={sidoOptions}
                    cities={sigunguOptions}
                    onChange={handleFilterChange}
                />
            </div>

            <div className="relative mt-14 rounded-[16px] bg-white p-8 shadow-lg">
                <img
                    src={adoptionImg}
                    alt="입양하기 강아지"
                    className="
            pointer-events-none
            absolute
            left-[-40px]
            top-[-183px]
            z-10
            hidden md:block
            w-[400px]
            h-auto
            select-none
          "
                    draggable={false}
                />

                {loading ? (
                    <div className="text-sm text-[#777]">Loading...</div>
                ) : error ? (
                    <div className="text-sm text-[#d14343]">{error}</div>
                ) : dogs.length === 0 ? (
                    <div className="text-sm text-[#777]">No dogs found.</div>
                ) : (
                    <DogGrid dogs={dogs} />
                )}

                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage1}
                        totalPages={totalPages}
                        onPrev={() => goToPage1(Math.max(currentPage1 - 1, 1))}
                        onNext={() => goToPage1(Math.min(currentPage1 + 1, totalPages))}
                    />
                </div>
            </div>
        </section>
    );
}
