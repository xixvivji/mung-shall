import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  fetchShelterCompletedAdoptions,
  fetchUpcomingVideoCallsByCompletedAdoptions,
  type ShelterCompletedAdoptionItem,
  type UpcomingCompletedAdoptionVideoCall,
} from "@/features/center/api/postAdoptionApi";
import useAuth from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/shared/api/client";
import { createConnection, createSession, openRoom } from "@/features/video-call/api/openViduApi";

type CallStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED" | "NO_SHOW";

type CallItem = {
  id: string;
  adopterName: string;
  phoneMasked: string;
  petName: string;
  adoptedAt: string;
  dateLabel: string;
  start: string;
  end: string;
  status: CallStatus;
  lastNote?: string;
  scheduledAt?: string | null;
  month?: number | null;
  sessionId?: string | null;
  postAdoptionId?: number;
  adoptionId?: number;
  imageUrl?: string;
  source?: "mock" | "post-adoption" | "completed-adoption-fallback";
  isTemporary?: boolean;
};

const MOCK_CALLS: CallItem[] = [
  {
    id: "p1",
    adopterName: "김지원",
    phoneMasked: "010-****-5678",
    petName: "꾸릉이",
    adoptedAt: "2025-12-02",
    dateLabel: "1월 28일 화요일",
    start: "14:00",
    end: "14:30",
    status: "UPCOMING",
    lastNote: "분리불안 증상 체크 필요",
    source: "mock",
  },
  {
    id: "p2",
    adopterName: "박정희",
    phoneMasked: "010-****-3333",
    petName: "구름이",
    adoptedAt: "2025-11-19",
    dateLabel: "1월 28일 화요일",
    start: "16:00",
    end: "16:30",
    status: "UPCOMING",
    source: "mock",
  },
  {
    id: "p3",
    adopterName: "차민성",
    phoneMasked: "010-****-1111",
    petName: "부릉이",
    adoptedAt: "2025-10-08",
    dateLabel: "1월 28일 화요일",
    start: "12:00",
    end: "12:30",
    status: "COMPLETED",
    lastNote: "식욕 양호, 산책 루틴 안정적",
    source: "mock",
  },
];

const KOREAN_WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function parseDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatDateLabel(date: Date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${KOREAN_WEEKDAYS[date.getDay()]}`;
}

function mapUpcomingCallToItem(call: UpcomingCompletedAdoptionVideoCall, index: number): CallItem {
  const scheduled = parseDateTime(call.scheduledAt);
  const start = scheduled ? formatTime(scheduled) : "00:00";
  const endDate = scheduled ? new Date(scheduled.getTime() + 30 * 60 * 1000) : null;
  const end = endDate ? formatTime(endDate) : "00:30";

  return {
    id: `post-${call.postAdoptionId}-${call.month ?? "na"}-${index}`,
    adopterName: call.adopterName || "입양자 정보 없음",
    phoneMasked: "-",
    petName: call.dogName || "강아지 정보 없음",
    adoptedAt: "-",
    dateLabel: scheduled ? formatDateLabel(scheduled) : "예약 시간 미정",
    start,
    end,
    status: "UPCOMING",
    scheduledAt: call.scheduledAt,
    month: call.month,
    sessionId: call.sessionId,
    postAdoptionId: call.postAdoptionId,
    adoptionId: call.adoptionId,
    imageUrl: call.imageUrl,
    source: "post-adoption",
  };
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone || "-";
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

function buildFallbackScheduledAt(adoptionCompletedAt: string | null, index: number) {
  if (adoptionCompletedAt) {
    const completed = new Date(adoptionCompletedAt);
    if (!Number.isNaN(completed.getTime())) {
      completed.setDate(completed.getDate() + 1);
      completed.setHours(14, 0, 0, 0);
      return completed.toISOString();
    }
  }
  return new Date(Date.now() + index * 30 * 60 * 1000).toISOString();
}

function mapCompletedAdoptionFallbackToItem(
  adoption: ShelterCompletedAdoptionItem,
  index: number
): CallItem {
  const scheduledAt = buildFallbackScheduledAt(adoption.adoptionCompletedAt, index);
  const scheduled = parseDateTime(scheduledAt) ?? new Date();
  const endDate = new Date(scheduled.getTime() + 30 * 60 * 1000);

  return {
    id: `completed-adoption-${adoption.adoptionId}`,
    adopterName: adoption.adopterName || "입양자 정보 없음",
    phoneMasked: maskPhone(adoption.adopterPhone),
    petName: adoption.dogName || "강아지 정보 없음",
    adoptedAt: adoption.adoptionCompletedAt ? adoption.adoptionCompletedAt.slice(0, 10) : "-",
    dateLabel: formatDateLabel(scheduled),
    start: formatTime(scheduled),
    end: formatTime(endDate),
    status: "UPCOMING",
    scheduledAt,
    adoptionId: adoption.adoptionId,
    imageUrl: adoption.imageUrl,
    source: "completed-adoption-fallback",
    isTemporary: true,
  };
}

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function callStatusVariant(status: CallStatus) {
  if (status === "IN_PROGRESS") return "default";
  if (status === "COMPLETED") return "secondary";
  if (status === "NO_SHOW") return "destructive";
  return "outline";
}

function callStatusLabel(status: CallStatus) {
  if (status === "IN_PROGRESS") return "진행중";
  if (status === "COMPLETED") return "완료";
  if (status === "NO_SHOW") return "노쇼";
  return "예정";
}

function relativeText(item: CallItem, nowMin: number) {
  const s = toMinutes(item.start);
  const e = toMinutes(item.end);
  if (nowMin < s) return `${s - nowMin}분 후 시작`;
  if (nowMin >= s && nowMin < e) return `진행 중 · ${e - nowMin}분 남음`;
  return "종료됨";
}

function monthToStepKey(month: number): 30 | 60 | 90 {
  if (month === 1) return 30;
  if (month === 2) return 60;
  if (month === 3) return 90;
  throw new Error(`Unsupported video-call month: ${month}`);
}

function monthToStepKeySafe(month?: number | null): 30 | 60 | 90 {
  if (month === 30 || month === 1) return 30;
  if (month === 60 || month === 2) return 60;
  if (month === 90 || month === 3) return 90;
  return 30;
}

export function CenterConsultSection() {
  const DEV_CALL_ALWAYS = import.meta.env.DEV;
  const navigate = useNavigate();
  const { user } = useAuth();
  const userType = String(user?.userType ?? "").toLowerCase();
  const isShelterUser = userType === "shelter" || userType === "center";

  const [nowMin, setNowMin] = React.useState(nowMinutes());
  React.useEffect(() => {
    const timer = setInterval(() => setNowMin(nowMinutes()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const [calls, setCalls] = React.useState<CallItem[]>(MOCK_CALLS);
  const [filter, setFilter] = React.useState<"오늘" | "예정" | "완료" | "노쇼">("오늘");
  const [selectedId, setSelectedId] = React.useState<string>(calls[0]?.id ?? "");
  const [note, setNote] = React.useState<string>("");
  const [startingCallId, setStartingCallId] = React.useState<string | null>(null);
  const [supplementLoading, setSupplementLoading] = React.useState(false);
  const [supplementError, setSupplementError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const MIN_REAL_UPCOMING_COUNT = 1;

    (async () => {
      setSupplementLoading(true);
      setSupplementError(null);
      try {
        const completedAdoptions = await fetchShelterCompletedAdoptions();
        if (cancelled) return;
        const upcoming = await fetchUpcomingVideoCallsByCompletedAdoptions(completedAdoptions);
        if (cancelled) return;

        const mappedRealUpcoming = upcoming.map(mapUpcomingCallToItem);
        setCalls((prev) => {
          const realKeys = new Set(
            prev.map((item) => `${item.postAdoptionId ?? ""}:${item.month ?? ""}:${item.scheduledAt ?? ""}`)
          );
          const nextRealUpcoming = mappedRealUpcoming.filter((item) => {
            const key = `${item.postAdoptionId ?? ""}:${item.month ?? ""}:${item.scheduledAt ?? ""}`;
            if (realKeys.has(key)) return false;
            realKeys.add(key);
            return true;
          });

          const merged = prev.concat(nextRealUpcoming);
          const realUpcomingCount = merged.filter(
            (item) => item.source === "post-adoption" && item.status === "UPCOMING"
          ).length;

          if (realUpcomingCount >= MIN_REAL_UPCOMING_COUNT) {
            return merged;
          }

          const adoptionIdsWithRealReservation = new Set(
            merged
              .filter((item) => item.source === "post-adoption")
              .map((item) => item.adoptionId)
              .filter((value): value is number => typeof value === "number" && value > 0)
          );
          const existingFallbackIds = new Set(merged.map((item) => item.id));

          const fallbackItems = completedAdoptions
            .filter((adoption) => !adoptionIdsWithRealReservation.has(adoption.adoptionId))
            .map(mapCompletedAdoptionFallbackToItem)
            .filter((item) => !existingFallbackIds.has(item.id));

          return fallbackItems.length ? merged.concat(fallbackItems) : merged;
        });
      } catch (error) {
        console.warn("[center-consult] failed to append upcoming post-adoption calls", error);
        setSupplementError("SUPPLEMENT_FETCH_FAILED");
      } finally {
        if (!cancelled) {
          setSupplementLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selected = React.useMemo(() => calls.find((c) => c.id === selectedId) ?? null, [calls, selectedId]);

  const selectedRequiresVideoCallMeta = selected?.source === "post-adoption";
  const hasRequiredMetaForSelected = selectedRequiresVideoCallMeta
    ? typeof selected?.postAdoptionId === "number" &&
      selected.postAdoptionId > 0 &&
      typeof selected?.month === "number" &&
      selected.month > 0
    : false;

  React.useEffect(() => {
    setNote(selected?.lastNote ?? "");
  }, [selectedId, selected?.lastNote]);

  React.useEffect(() => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.status !== "UPCOMING") return c;
        const s = toMinutes(c.start);
        const e = toMinutes(c.end);
        if (nowMin >= s && nowMin < e) return { ...c, status: "IN_PROGRESS" };
        return c;
      })
    );
  }, [nowMin]);

  const summary = React.useMemo(() => {
    const baseCalls = calls.filter((item) => item.source !== "completed-adoption-fallback");
    const total = baseCalls.length;
    const inProgress = baseCalls.filter((c) => c.status === "IN_PROGRESS").length;
    const done = baseCalls.filter((c) => c.status === "COMPLETED").length;
    const noshow = baseCalls.filter((c) => c.status === "NO_SHOW").length;
    const soon = baseCalls.filter((c) => {
      if (c.status !== "UPCOMING") return false;
      const diff = toMinutes(c.start) - nowMin;
      return diff <= 10 && diff >= 0;
    }).length;
    return { total, inProgress, soon, done, noshow };
  }, [calls, nowMin]);

  const filtered = React.useMemo(() => {
    if (filter === "오늘") return calls.filter((item) => item.source !== "completed-adoption-fallback");
    if (filter === "예정") return calls.filter((c) => c.status === "UPCOMING" || c.status === "IN_PROGRESS");
    if (filter === "완료") return calls.filter((c) => c.status === "COMPLETED");
    return calls.filter((c) => c.status === "NO_SHOW");
  }, [calls, filter]);

  const groups = React.useMemo(() => {
    const soon: CallItem[] = [];
    const upcoming: CallItem[] = [];
    const completed: CallItem[] = [];

    for (const c of filtered) {
      const s = toMinutes(c.start);

      if (c.status === "COMPLETED" || c.status === "NO_SHOW") {
        completed.push(c);
        continue;
      }

      if (c.status === "IN_PROGRESS") {
        soon.push(c);
        continue;
      }

      const diff = s - nowMin;
      if (diff <= 10 && diff >= 0) soon.push(c);
      else upcoming.push(c);
    }

    const sortByStart = (a: CallItem, b: CallItem) => toMinutes(a.start) - toMinutes(b.start);
    soon.sort(sortByStart);
    upcoming.sort(sortByStart);
    completed.sort(sortByStart);

    return { soon, upcoming, completed };
  }, [filtered, nowMin]);

  const setStatus = (id: string, status: CallStatus) => {
    setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const saveNote = () => {
    if (!selected) return;
    setCalls((prev) => prev.map((c) => (c.id === selected.id ? { ...c, lastNote: note } : c)));
  };

  const handleStartCall = async () => {
    if (startingCallId) return;
    const target =
      selected &&
      typeof selected.postAdoptionId === "number" &&
      selected.postAdoptionId > 0 &&
      typeof selected.month === "number" &&
      selected.month > 0
        ? selected
        : calls.find(
            (item) =>
              typeof item.postAdoptionId === "number" &&
              item.postAdoptionId > 0 &&
              typeof item.month === "number" &&
              item.month > 0
          ) ?? null;

    const postAdoptionId = target?.postAdoptionId ?? 1;
    const month = target?.month ?? 1;
    const stepKey = monthToStepKeySafe(month);

    if (import.meta.env.DEV) {
      console.debug("[call] start clicked", {
        selectedId: selected?.id ?? null,
        selectedSource: selected?.source ?? null,
        targetId: target?.id ?? null,
        postAdoptionId,
        month,
        stepKey,
        isShelterUser,
        bypass: DEV_CALL_ALWAYS,
      });
    }

    if (DEV_CALL_ALWAYS) {
      navigate(`/video/${postAdoptionId}/${stepKey}`, {
        state: {
          clientData: "ShelterUser",
          role: String(user?.userType ?? "SHELTER"),
          postAdoptionId,
          month,
          autoJoin: true,
          bypassStartCallGuards: true,
        },
      });
      return;
    }

    if (!isShelterUser) return;
    if (!target) {
      alert("화상 상담 시작에 필요한 예약 정보를 찾을 수 없습니다.");
      return;
    }

    setStartingCallId(target.id);
    try {
      let resolvedSessionId = target.sessionId ?? null;

      if (!resolvedSessionId) {
        const fallbackSessionId = `postcare_${postAdoptionId}_${monthToStepKey(month)}`;
        const sessionResponse = await createSession(fallbackSessionId);
        resolvedSessionId = sessionResponse.sessionId;
        await openRoom(postAdoptionId, month, resolvedSessionId);
      }

      const connectionResponse = await createConnection(resolvedSessionId, {
        role: "PUBLISHER",
        clientData: "ShelterUser",
      });
      const token = connectionResponse.token;

      setCalls((prev) =>
        prev.map((item) => (item.id === target.id ? { ...item, sessionId: resolvedSessionId } : item))
      );

      navigate(`/video/${postAdoptionId}/${monthToStepKey(month)}`, {
        state: {
          sessionId: resolvedSessionId,
          token,
          clientData: "ShelterUser",
          role: String(user?.userType ?? "SHELTER"),
          postAdoptionId,
          month,
          adopterName: target.adopterName,
          autoJoin: true,
        },
      });
    } catch (error) {
      console.error("[center-consult] failed to start call", { selected, target, error });
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        window.location.assign("/auth/login");
        return;
      }
      const message = error instanceof Error ? error.message : "화상 상담 연결 준비에 실패했습니다.";
      alert(message);
    } finally {
      setStartingCallId(null);
    }
  };

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">화상 상담</CardTitle>
            <CardDescription className="mt-2 text-sm text-slate-600">
              입양자와의 화상상담 예약을 관리하고 통화를 진행합니다.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["오늘", "예정", "완료", "노쇼"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm transition",
                  filter === k
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-5">
          <SummaryCard label="오늘 예약" value={summary.total} />
          <SummaryCard label="진행중" value={summary.inProgress} tone="blue" />
          <SummaryCard label="곧 시작(10분)" value={summary.soon} tone="blue" />
          <SummaryCard label="완료" value={summary.done} />
          <SummaryCard label="노쇼" value={summary.noshow} tone="red" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3 text-sm font-semibold text-slate-900">
              예약 목록 ({filtered.length})
              {supplementLoading && (
                <span className="ml-2 text-xs font-normal text-slate-500">COMPLETED 데이터 동기화 중...</span>
              )}
              {import.meta.env.DEV && supplementError && (
                <span className="ml-2 text-xs font-normal text-amber-600">COMPLETED 데이터 보강 실패</span>
              )}
            </div>

            <div className="max-h-[640px] space-y-4 overflow-auto p-3">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">표시할 예약이 없습니다.</div>
              ) : (
                <>
                  {groups.soon.length > 0 && (
                    <GroupBlock title="SOON / IN PROGRESS" tone="blue">
                      {groups.soon.map((c) => (
                        <CallRow
                          key={c.id}
                          item={c}
                          active={c.id === selectedId}
                          nowMin={nowMin}
                          badgeVariant={callStatusVariant(c.status) as any}
                          statusLabel={callStatusLabel(c.status)}
                          onClick={() => setSelectedId(c.id)}
                        />
                      ))}
                    </GroupBlock>
                  )}

                  {groups.upcoming.length > 0 && (
                    <GroupBlock title="UPCOMING" tone="slate">
                      {groups.upcoming.map((c) => (
                        <CallRow
                          key={c.id}
                          item={c}
                          active={c.id === selectedId}
                          nowMin={nowMin}
                          badgeVariant={callStatusVariant(c.status) as any}
                          statusLabel={callStatusLabel(c.status)}
                          onClick={() => setSelectedId(c.id)}
                        />
                      ))}
                    </GroupBlock>
                  )}

                  {groups.completed.length > 0 && (
                    <GroupBlock title="COMPLETED / NO-SHOW" tone="slate">
                      {groups.completed.map((c) => (
                        <CallRow
                          key={c.id}
                          item={c}
                          active={c.id === selectedId}
                          nowMin={nowMin}
                          badgeVariant={callStatusVariant(c.status) as any}
                          statusLabel={callStatusLabel(c.status)}
                          onClick={() => setSelectedId(c.id)}
                        />
                      ))}
                    </GroupBlock>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            {!selected ? (
              <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">예약을 선택해주세요.</div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {selected.adopterName} · {selected.petName}
                      </div>
                      <Badge variant={callStatusVariant(selected.status) as any}>{callStatusLabel(selected.status)}</Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selected.dateLabel} · {selected.start} - {selected.end}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      연락처 {selected.phoneMasked} · 입양일 {selected.adoptedAt}
                    </div>
                    {selected.source === "completed-adoption-fallback" && (
                      <div className="mt-1 text-[11px] text-amber-600">임시 예약(테스트 데이터)</div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(selected.id, "COMPLETED")}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      완료 처리
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(selected.id, "NO_SHOW")}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100/60"
                    >
                      노쇼 처리
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <div className="text-sm font-semibold text-slate-900">화상상담</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {relativeText(selected, nowMin)} · 시작 10분 전부터 통화 가능
                  </div>

                  <button
                    type="button"
                    className="mt-4 w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                    onClick={() => void handleStartCall()}
                  >
                    {startingCallId === selected.id ? "연결 중..." : "통화 시작하기"}
                  </button>
                  {selectedRequiresVideoCallMeta && !hasRequiredMetaForSelected && (
                    <div className="mt-2 text-xs text-slate-500">화상 상담 메타 정보가 없어 통화를 시작할 수 없습니다.</div>
                  )}
                  {!isShelterUser && (
                    <div className="mt-2 text-xs text-slate-500">보호소 계정에서만 통화를 시작할 수 있습니다.</div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">상담 체크리스트</div>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">
                    <li>• 최근 건강 상태(식욕/배변/병원 방문)</li>
                    <li>• 행동 이슈(분리불안/짖음/공격성)</li>
                    <li>• 산책/운동 루틴</li>
                    <li>• 교육 진행 상황(기본 명령/사회화)</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">상담 메모</div>
                    <button
                      type="button"
                      onClick={saveNote}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      저장
                    </button>
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="통화 내용/추가 조치 사항을 기록하세요."
                    className="mt-3 h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-900"
                  />
                  <div className="mt-1 text-[11px] text-slate-500">* 저장 시 해당 예약의 메모로 기록됩니다(Mock).</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  tone = "slate",
}: {
  label: string;
  value: number;
  tone?: "slate" | "blue" | "red";
}) {
  const cls =
    tone === "blue"
      ? "border-blue-200 bg-blue-50"
      : tone === "red"
        ? "border-red-200 bg-red-50"
        : "border-slate-200 bg-white";

  const labelCls = tone === "blue" ? "text-blue-600" : tone === "red" ? "text-red-600" : "text-slate-500";

  return (
    <div className={["rounded-2xl border p-4", cls].join(" ")}>
      <div className={["text-xs", labelCls].join(" ")}>{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function GroupBlock({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "blue" | "slate";
  children: React.ReactNode;
}) {
  const titleCls = tone === "blue" ? "text-blue-600" : "text-slate-500";
  return (
    <div className="space-y-2">
      <div className={["text-[11px] font-semibold tracking-wide", titleCls].join(" ")}>{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CallRow({
  item,
  active,
  nowMin,
  badgeVariant,
  statusLabel,
  onClick,
}: {
  item: CallItem;
  active: boolean;
  nowMin: number;
  badgeVariant: any;
  statusLabel: string;
  onClick: () => void;
}) {
  const isHot =
    item.status === "IN_PROGRESS" ||
    (item.status === "UPCOMING" &&
      (() => {
        const diff = toMinutes(item.start) - nowMin;
        return diff <= 10 && diff >= 0;
      })());

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-2xl border px-4 py-3 text-left transition",
        active
          ? "border-slate-900 bg-slate-900/5"
          : isHot
            ? "border-blue-200 bg-blue-50 hover:bg-blue-100/40"
            : "border-slate-200 bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className={["truncate text-sm", active ? "font-semibold text-slate-900" : "text-slate-800"].join(" ")}>
              {item.adopterName} · {item.petName}
            </div>
            <Badge variant={badgeVariant}>{statusLabel}</Badge>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {item.dateLabel} · {item.start} - {item.end}
          </div>
          {item.lastNote && <div className="mt-1 truncate text-xs text-slate-600">메모: {item.lastNote}</div>}
        </div>

        <div className="text-xs font-medium text-slate-600">{relativeText(item, nowMin)}</div>
      </div>
    </button>
  );
}
