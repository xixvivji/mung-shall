import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import BoardList from "../components/BoardList";
import Pagination from "@/features/adoption/components/Pagination";
import { fetchBoardList, toBoardApiError } from "../api/boardApi";
import type { BoardSummary } from "../types";

type BoardCategoryFilter = "ALL" | "FREE" | "REVIEW";

function parsePage1(params: URLSearchParams) {
  const raw = params.get("page");
  const value = Number(raw);
  if (!raw || Number.isNaN(value) || value < 1) return 1;
  return Math.floor(value);
}

function parseCategory(params: URLSearchParams): BoardCategoryFilter {
  const raw = (params.get("category") ?? "ALL").toUpperCase();
  if (raw === "FREE" || raw === "REVIEW") return raw;
  return "ALL";
}

export default function BoardListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const currentPage1 = useMemo(() => parsePage1(searchParams), [searchParams]);
  const page0 = currentPage1 - 1;

  const q = searchParams.get("q") ?? "";
  const category = useMemo(() => parseCategory(searchParams), [searchParams]);

  useEffect(() => {
    setQuery(q);
  }, [q]);

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

  const setCategoryFilter = useCallback(
      (nextCategory: BoardCategoryFilter) => {
        setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);

              if (nextCategory === "ALL") next.delete("category");
              else next.set("category", nextCategory);

              // 탭 바꾸면 1페이지로
              next.set("page", "1");
              return next;
            },
            { replace: true }
        );
      },
      [setSearchParams]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchBoardList({
      page: page0,
      size: 10,
      q: q || undefined,
      category: category === "ALL" ? undefined : category,
    })
        .then((result) => {
          if (cancelled) return;
          setItems(result.items);
          setTotalPages(result.totalPages || 1);
        })
        .catch((err) => {
          if (cancelled) return;
          const boardError = toBoardApiError(err);
          setError(boardError.message);
        })
        .finally(() => {
          if (cancelled) return;
          setLoading(false);
        });

    return () => {
      cancelled = true;
    };
  }, [page0, q, category]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (query.trim()) {
            next.set("q", query.trim());
          } else {
            next.delete("q");
          }
          next.set("page", "1");
          return next;
        },
        { replace: true }
    );
  };

  const tabBase =
      "h-10 rounded-[999px] px-4 text-sm font-semibold transition border";
  const tabActive = "bg-[#111827] text-white border-[#111827]";
  const tabInactive = "bg-white text-[#111827] border-[#E5E7EB] hover:bg-[#F7F8FA]";

  return (
      <section className="bg-[#F7F8FA]">
        <div className="mx-auto max-w-[1440px] px-8 py-12">
          <div className="space-y-3">
            <p className="text-sm text-[#6B7280]">홈 &gt; 게시판</p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-[32px] font-bold text-[#1F2937]">게시판</h1>

              <Link
                  to="/boards/new"
                  className="h-12 rounded-[12px] bg-[#5B7CFA] px-6 text-sm font-semibold text-white transition hover:brightness-95"
              >
                글쓰기
              </Link>
            </div>
          </div>

          {/* 카테고리 탭 */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => setCategoryFilter("ALL")}
                className={`${tabBase} ${category === "ALL" ? tabActive : tabInactive}`}
            >
              전체
            </button>
            <button
                type="button"
                onClick={() => setCategoryFilter("FREE")}
                className={`${tabBase} ${category === "FREE" ? tabActive : tabInactive}`}
            >
              자유
            </button>
            <button
                type="button"
                onClick={() => setCategoryFilter("REVIEW")}
                className={`${tabBase} ${category === "REVIEW" ? tabActive : tabInactive}`}
            >
              후기
            </button>

            <span className="ml-2 text-xs text-[#6B7280]">
            {category === "ALL"
                ? "전체 게시글"
                : category === "FREE"
                    ? "자유 게시판"
                    : "입양 후기 게시판"}
          </span>
          </div>

          <div className="mt-6 rounded-[16px] bg-white p-6 shadow-lg">
            <form className="flex flex-wrap gap-3" onSubmit={handleSubmit}>
              <input
                  className="h-12 flex-1 rounded-[12px] border border-[#E5E7EB] px-4 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
                  placeholder="검색어를 입력해주세요."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
              />
              <button
                  type="submit"
                  className="h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-6 text-sm font-semibold text-[#1F2937] transition hover:bg-[#F7F8FA]"
              >
                검색
              </button>
            </form>
          </div>

          <div className="mt-8 rounded-[16px] bg-white p-8 shadow-lg">
            <BoardList items={items} loading={loading} error={error} />
          </div>

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
