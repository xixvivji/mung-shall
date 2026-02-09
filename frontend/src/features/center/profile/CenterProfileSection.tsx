import * as React from "react";
import { fetchCenterProfile, fetchMe } from "../api/centerProfileApi";
import type { CenterProfile } from "./types";

const EMPTY_PROFILE: CenterProfile = {
  centerName: "",
  phoneNumber: "",
  address: "",
  description: "",
};

function isNotFoundError(message: string) {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("404") ||
    lowered.includes("not found") ||
    lowered.includes("존재하지 않는 경로")
  );
}

function formatError(err: unknown) {
  const rawMessage = err instanceof Error ? err.message : "요청에 실패했습니다.";
  let message = rawMessage;
  try {
    const parsed = JSON.parse(rawMessage);
    if (parsed && typeof parsed.message === "string") {
      message = parsed.message;
    }
  } catch {
    // ignore JSON parse errors
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
  if (isNotFoundError(message)) {
    return "센터 프로필이 존재하지 않습니다.";
  }
  return message || "요청에 실패했습니다.";
}

export function CenterProfileSection() {
  const [profile, setProfile] = React.useState<CenterProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [accessDenied, setAccessDenied] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchMe()
      .then((meResponse) => {
        if (!active) return;
        if (meResponse.userType !== "shelter") {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        return fetchCenterProfile(meResponse.userId);
      })
      .then((loaded) => {
        if (!active || !loaded) return;
        setProfile({
          centerName: loaded.centerName ?? "",
          phoneNumber: loaded.phoneNumber ?? "",
          address: loaded.address ?? "",
          description: loaded.description ?? "",
        });
      })
      .catch((err) => {
        if (!active) return;
        setError(formatError(err));
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">센터 프로필</h1>
          <p className="mt-1 text-sm text-slate-600">
            센터 정보(센터명/주소/연락처)를 확인합니다.
          </p>
        </div>
      </div>

      {loading && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
          센터 프로필을 불러오는 중...
        </div>
      )}

      {accessDenied && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          센터(보호소) 계정만 센터 프로필을 열람할 수 있습니다.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !accessDenied && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">센터명</label>
            <input
              value={profile.centerName}
              readOnly
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">연락처</label>
            <input
              value={profile.phoneNumber}
              readOnly
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">주소</label>
            <input
              value={profile.address}
              readOnly
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-600">소개 / 설명</label>
            <textarea
              value={profile.description ?? ""}
              readOnly
              rows={4}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
