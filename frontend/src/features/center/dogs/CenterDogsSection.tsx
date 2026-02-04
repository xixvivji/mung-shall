import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { api } from "@/shared/api/client";
import { fetchMe, type CenterDog } from "../api/centerDogsApi";
import Pagination from "../components/Pagination";

type LoadState = "idle" | "loading" | "error";

type CenterDogApiItem = {
  dogId?: number;
  id?: number;
  desertionNo?: string;
  kindNm?: string;
  name?: string;
  imageUrl?: string;
  noticeNo?: string;
  processState?: string;
};

type CenterDogsPageResponse = {
  content?: CenterDogApiItem[];
  totalElements?: number;
  totalPages?: number;
  number?: number; // 0-based
  size?: number;
};

function mapDog(item: CenterDogApiItem): CenterDog {
  const idValue = item.dogId ?? item.id;
  return {
    id: idValue ? String(idValue) : item.desertionNo ?? "",
    kind: item.kindNm ?? item.name ?? "Unknown",
    status: item.processState ?? "보호중",
    desertionNo: item.desertionNo ?? item.noticeNo ?? "",
    imageUrl: item.imageUrl,
  };
}

function formatError(err: unknown) {
  const rawMessage = err instanceof Error ? err.message : "요청에 실패했습니다.";
  let message = rawMessage;
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed && typeof parsed.message === "string") message = parsed.message;
  } catch {}
  const lowered = message.toLowerCase();
  if (
    lowered.includes("401") ||
    lowered.includes("403") ||
    lowered.includes("unauthorized") ||
    lowered.includes("forbidden")
  ) {
    return "권한이 없습니다.";
  }
  if (lowered.includes("404") || lowered.includes("not found")) {
    return "보호 중인 동물 목록이 없습니다.";
  }
  return message || "요청에 실패했습니다.";
}

export function CenterDogsSection() {
  const [dogs, setDogs] = React.useState<CenterDog[]>([]);
  const [state, setState] = React.useState<LoadState>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);

  const [page, setPage] = React.useState(0);
  const [size] = React.useState(12); // 필요하면 나중에 select로 확장
  const [totalPages, setTotalPages] = React.useState(1);

  const loadPage = React.useCallback(async (p: number) => {
    setState("loading");
    setError(null);

    try {
      const me = await fetchMe();
      if (me.userType !== "shelter") {
        setAccessDenied(true);
        setState("idle");
        return;
      }

      const res = await api<CenterDogsPageResponse>(`/shelters/me/dogs?page=${p}&size=${size}`);

      const list = (res.content ?? []).map(mapDog);
      setDogs(list);

      // 서버가 주는 number/totalPages 신뢰(없으면 fallback)
      setPage(res.number ?? p);
      setTotalPages(res.totalPages ?? 1);

      setState("idle");
    } catch (err) {
      setError(formatError(err));
      setState("error");
    }
  }, [size]);

  React.useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await loadPage(page);
    })();

    return () => {
      active = false;
    };
  }, [page, loadPage]);

  const canShowPagination = !accessDenied && !error && totalPages > 1 && state !== "loading";

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">보호 중</CardTitle>
          <CardDescription className="text-sm text-slate-600">
            센터에서 현재 보호 중인 강아지 목록입니다.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {accessDenied && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            센터(보호소) 계정만 확인할 수 있습니다.
          </div>
        )}

        {state === "loading" && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            보호 중인 동물 목록을 불러오는 중...
          </div>
        )}

        {state === "error" && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {state !== "loading" && !accessDenied && !error && dogs.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            보호 중인 동물이 없습니다.
          </div>
        )}

        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
            >
              <Badge variant="secondary" className="absolute left-3 top-3 z-10">
                {dog.status}
              </Badge>

              <div className="aspect-square overflow-hidden bg-slate-100">
                {dog.imageUrl ? (
                  <img
                    src={dog.imageUrl}
                    alt={dog.kind}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="p-3">
                <div className="text-sm font-medium text-slate-900">{dog.kind}</div>
                <div className="mt-0.5 text-xs text-slate-500">desertionNo | {dog.desertionNo}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination.tsx 연결 (1-based로 변환해서 전달) */}
        {canShowPagination && (
          <div className="mt-10 flex justify-center">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
