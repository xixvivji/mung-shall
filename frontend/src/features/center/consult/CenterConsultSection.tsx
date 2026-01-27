import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

type CallStatus = "예정" | "진행중" | "완료" | "노쇼";

type CallItem = {
  id: string;
  adopterName: string; // 입양자
  phoneMasked: string; // 010-****-1234
  petName: string; // 반려견 이름
  adoptedAt: string; // "2025-12-02"
  dateLabel: string; // "1월 28일 화요일"
  start: string; // "14:00"
  end: string; // "14:30"
  status: CallStatus;
  lastNote?: string;
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
    status: "예정",
    lastNote: "분리불안 증상 체크 필요",
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
    status: "예정",
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
    status: "완료",
    lastNote: "식욕 양호, 산책 루틴 안정적",
  },
];

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

// 시작 10분 전 ~ 종료까지 “통화 가능”
function canCall(item: CallItem, nowMin: number) {
  const s = toMinutes(item.start);
  const e = toMinutes(item.end);
  return nowMin >= s - 10 && nowMin < e;
}

function callStatusVariant(status: CallStatus) {
  // shadcn badge variants: default | secondary | destructive | outline
  if (status === "진행중") return "default";
  if (status === "완료") return "secondary";
  if (status === "노쇼") return "destructive";
  return "outline";
}

function relativeText(item: CallItem, nowMin: number) {
  const s = toMinutes(item.start);
  const e = toMinutes(item.end);
  if (nowMin < s) return `${s - nowMin}분 후 시작`;
  if (nowMin >= s && nowMin < e) return `진행 중 · ${e - nowMin}분 남음`;
  return "종료됨";
}

export function CenterConsultSection() {
  const [nowMin, setNowMin] = React.useState(nowMinutes());
  React.useEffect(() => {
    const t = setInterval(() => setNowMin(nowMinutes()), 60_000);
    return () => clearInterval(t);
  }, []);

  const [calls, setCalls] = React.useState<CallItem[]>(MOCK_CALLS);
  const [filter, setFilter] = React.useState<"오늘" | "예정" | "완료" | "노쇼">("오늘");
  const [selectedId, setSelectedId] = React.useState<string>(calls[0]?.id ?? "");
  const [note, setNote] = React.useState<string>("");

  const selected = React.useMemo(
    () => calls.find((c) => c.id === selectedId) ?? null,
    [calls, selectedId]
  );

  React.useEffect(() => {
    setNote(selected?.lastNote ?? "");
  }, [selectedId, selected?.lastNote]);

  // “예정”인데 시간이 들어오면 자동으로 “진행중”
  React.useEffect(() => {
    setCalls((prev) =>
      prev.map((c) => {
        if (c.status !== "예정") return c;
        const s = toMinutes(c.start);
        const e = toMinutes(c.end);
        if (nowMin >= s && nowMin < e) return { ...c, status: "진행중" };
        return c;
      })
    );
  }, [nowMin]);

  const summary = React.useMemo(() => {
    const total = calls.length;
    const inProgress = calls.filter((c) => c.status === "진행중").length;
    const done = calls.filter((c) => c.status === "완료").length;
    const noshow = calls.filter((c) => c.status === "노쇼").length;
    const soon = calls.filter((c) => {
      if (c.status !== "예정") return false;
      const diff = toMinutes(c.start) - nowMin;
      return diff <= 10 && diff >= 0;
    }).length;
    return { total, inProgress, soon, done, noshow };
  }, [calls, nowMin]);

  const filtered = React.useMemo(() => {
    if (filter === "오늘") return calls;
    if (filter === "예정") return calls.filter((c) => c.status === "예정" || c.status === "진행중");
    return calls.filter((c) => c.status === filter);
  }, [calls, filter]);

  // 그룹핑: 곧 시작/진행중, 예정, 완료/노쇼
  const groups = React.useMemo(() => {
    const soon: CallItem[] = [];
    const upcoming: CallItem[] = [];
    const completed: CallItem[] = [];

    for (const c of filtered) {
      const s = toMinutes(c.start);

      if (c.status === "완료" || c.status === "노쇼") {
        completed.push(c);
        continue;
      }

      if (c.status === "진행중") {
        soon.push(c);
        continue;
      }

      // 예정
      const diff = s - nowMin;
      if (diff <= 10 && diff >= 0) soon.push(c);
      else upcoming.push(c);
    }

    // 시간순 정렬(운영 편의)
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

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">화상 상담</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              입양 완료자(기존 입양자)와의 전화상담 예약을 관리하고 통화를 진행합니다.
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
        {/* 요약 */}
        <div className="grid gap-3 sm:grid-cols-5">
          <SummaryCard label="오늘 예약" value={summary.total} />
          <SummaryCard label="진행중" value={summary.inProgress} tone="blue" />
          <SummaryCard label="곧 시작(10분)" value={summary.soon} tone="blue" />
          <SummaryCard label="완료" value={summary.done} />
          <SummaryCard label="노쇼" value={summary.noshow} tone="red" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[420px_1fr]">
          {/* 목록 */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3 text-sm font-semibold text-slate-900">
              예약 목록 ({filtered.length})
            </div>

            <div className="max-h-[640px] overflow-auto p-3 space-y-4">
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
                          onClick={() => setSelectedId(c.id)}
                        />
                      ))}
                    </GroupBlock>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 상세 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            {!selected ? (
              <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
                예약을 선택해주세요.
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-base font-semibold text-slate-900">
                        {selected.adopterName} · {selected.petName}
                      </div>
                      <Badge variant={callStatusVariant(selected.status) as any}>
                        {selected.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {selected.dateLabel} · {selected.start} - {selected.end}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      연락처 {selected.phoneMasked} · 입양일 {selected.adoptedAt}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus(selected.id, "완료")}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      완료 처리
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(selected.id, "노쇼")}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 hover:bg-red-100/60"
                    >
                      노쇼 처리
                    </button>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <div className="text-sm font-semibold text-slate-900">전화상담</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {relativeText(selected, nowMin)} · 시작 10분 전부터 통화 가능
                  </div>

                  <button
                    type="button"
                    disabled={
                      !canCall(selected, nowMin) ||
                      selected.status === "완료" ||
                      selected.status === "노쇼"
                    }
                    className={[
                      "mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      canCall(selected, nowMin) && selected.status !== "완료" && selected.status !== "노쇼"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "cursor-not-allowed bg-slate-200 text-slate-500",
                    ].join(" ")}
                    onClick={() => {
                      if (!canCall(selected, nowMin)) return;
                      alert("TODO: 전화 연결/통화 기능 연동");
                    }}
                  >
                    통화 시작하기
                  </button>

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
                  <div className="mt-1 text-[11px] text-slate-500">
                    * 저장 시 해당 예약의 메모로 기록됩니다(Mock).
                  </div>
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

  const labelCls =
    tone === "blue" ? "text-blue-600" : tone === "red" ? "text-red-600" : "text-slate-500";

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
  onClick,
}: {
  item: CallItem;
  active: boolean;
  nowMin: number;
  badgeVariant: any;
  onClick: () => void;
}) {
  const isHot =
    item.status === "진행중" ||
    (item.status === "예정" && (() => {
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
            <Badge variant={badgeVariant}>{item.status}</Badge>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {item.dateLabel} · {item.start} - {item.end}
          </div>
          {item.lastNote && (
            <div className="mt-1 truncate text-xs text-slate-600">메모: {item.lastNote}</div>
          )}
        </div>

        <div className="text-xs font-medium text-slate-600">{relativeText(item, nowMin)}</div>
      </div>
    </button>
  );
}
