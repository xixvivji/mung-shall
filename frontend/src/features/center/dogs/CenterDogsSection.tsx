import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { fetchCenterDogs, fetchMe, type CenterDog } from "../api/centerDogsApi";

type LoadState = "idle" | "loading" | "error";

function formatError(err: unknown) {
  const rawMessage = err instanceof Error ? err.message : "요청에 실패했습니다.";
  let message = rawMessage;
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed && typeof parsed.message === "string") {
      message = parsed.message;
    }
  } catch {
    // ignore
  }
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

  React.useEffect(() => {
    let active = true;
    setState("loading");
    setError(null);

    fetchMe()
      .then((meResponse) => {
        if (!active) return;
        if (meResponse.userType !== "shelter") {
          setAccessDenied(true);
          setState("idle");
          return;
        }
        return fetchCenterDogs(meResponse.userId);
      })
      .then((list) => {
        if (!active || !list) return;
        setDogs(list);
        setState("idle");
      })
      .catch((err) => {
        if (!active) return;
        setError(formatError(err));
        setState("error");
      });

    return () => {
      active = false;
    };
  }, []);

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
                <div className="mt-0.5 text-xs text-slate-500">
                  desertionNo | {dog.desertionNo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
