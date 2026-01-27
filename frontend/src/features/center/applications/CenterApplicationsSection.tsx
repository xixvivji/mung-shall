import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";

import surveyImg from "@/assets/images/입양설문지.png";
import applicationImg from "@/assets/images/입양신청서.png";

type ApplicationStatus = "대기" | "승인" | "반려";

type ApplicationDoc = {
  id: string;
  name: string;
  url: string;
  kind?: "survey" | "application"; // ✅ 미리보기 매핑용(추가)
};

type AdoptionApplication = {
  id: string;
  dog: {
    id: string;
    name: string;
    imageUrl: string;
    desertionNo: string;
  };
  applicant: {
    name: string;
    phone: string;
  };
  status: ApplicationStatus;
  submittedAt: string;
  docs: ApplicationDoc[];
};

const MOCK_APPS: AdoptionApplication[] = [
  {
    id: "a1",
    dog: {
      id: "d1",
      name: "믹스견",
      imageUrl: "/assets/images/dog1.png",
      desertionNo: "430366202500851",
    },
    applicant: {
      name: "김재빈",
      phone: "010-1234-5678",
    },
    status: "대기",
    submittedAt: "2026-01-27 10:20",
    docs: [
      { id: "doc1", name: "입양_설문지.pdf", url: "#", kind: "survey" },
      { id: "doc2", name: "입양_신청서.pdf", url: "#", kind: "application" },
    ],
  },
  {
    id: "a2",
    dog: {
      id: "d2",
      name: "비숑",
      imageUrl: "/assets/images/dog2.png",
      desertionNo: "430366202500852",
    },
    applicant: {
      name: "정주환",
      phone: "010-2222-3333",
    },
    status: "대기",
    submittedAt: "2026-01-27 11:05",
    docs: [
      { id: "doc1", name: "입양_설문지.pdf", url: "#", kind: "survey" },
      { id: "doc2", name: "입양_신청서.pdf", url: "#", kind: "application" },
    ],
  },
];

function statusBadgeVariant(status: ApplicationStatus) {
  if (status === "승인") return "default";
  if (status === "반려") return "destructive";
  return "secondary";
}

type PreviewKind = "survey" | "application";

function previewMeta(kind: PreviewKind) {
  if (kind === "survey") {
    return { title: "입양 설문지", img: surveyImg };
  }
  return { title: "입양 신청서", img: applicationImg };
}

export function CenterApplicationsSection() {
  const [apps, setApps] = React.useState<AdoptionApplication[]>(MOCK_APPS);
  const [selectedId, setSelectedId] = React.useState<string>(MOCK_APPS[0]?.id ?? "");
  const [rejectReason, setRejectReason] = React.useState("");
  const [filter, setFilter] = React.useState<"전체" | ApplicationStatus>("전체");

  // ✅ 미리보기 상태 추가
  const [preview, setPreview] = React.useState<PreviewKind>("survey");

  const filtered = React.useMemo(() => {
    if (filter === "전체") return apps;
    return apps.filter((a) => a.status === filter);
  }, [apps, filter]);

  const selected = React.useMemo(
    () => apps.find((a) => a.id === selectedId) ?? null,
    [apps, selectedId]
  );

  // ✅ 신청 선택이 바뀌면 미리보기/반려사유 초기화
  React.useEffect(() => {
    setRejectReason("");
    setPreview("survey");
  }, [selectedId]);

  const onApprove = () => {
    if (!selected) return;
    setApps((prev) =>
      prev.map((a) => (a.id === selected.id ? { ...a, status: "승인" } : a))
    );
  };

  const onReject = () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      alert("반려 사유를 입력해주세요.");
      return;
    }
    setApps((prev) =>
      prev.map((a) => (a.id === selected.id ? { ...a, status: "반려" } : a))
    );
  };

  const meta = previewMeta(preview);

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">입양 신청</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              신청자 서류를 확인하고 승인/반려 처리합니다.
            </CardDescription>
          </div>

          {/* 필터 */}
          <div className="flex gap-2">
            {(["전체", "대기", "승인", "반려"] as const).map((k) => (
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
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          {/* 좌측: 신청 목록 */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3 text-sm font-medium text-slate-900">
              신청 목록 ({filtered.length})
            </div>

            <div className="max-h-[520px] overflow-auto p-2">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">표시할 신청이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((a) => {
                    const active = a.id === selectedId;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setSelectedId(a.id)}
                        className={[
                          "w-full rounded-2xl border p-3 text-left transition",
                          active
                            ? "border-slate-900 bg-slate-900/5"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                            <img
                              src={a.dog.imageUrl}
                              alt={a.dog.name}
                              className="h-full w-full object-cover"
                              draggable={false}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {a.applicant.name} 님
                              </div>
                              <Badge variant={statusBadgeVariant(a.status) as any}>
                                {a.status}
                              </Badge>
                            </div>

                            <div className="mt-0.5 truncate text-xs text-slate-600">
                              {a.dog.name} · desertionNo {a.dog.desertionNo}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              제출 {a.submittedAt}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 우측: 상세 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {!selected ? (
              <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
                신청을 선택해주세요.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* 상단: 요약 */}
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    <img
                      src={selected.dog.imageUrl}
                      alt={selected.dog.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {selected.applicant.name} 님 신청
                      </div>
                      <Badge variant={statusBadgeVariant(selected.status) as any}>
                        {selected.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {selected.dog.name} · desertionNo {selected.dog.desertionNo}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      연락처 {selected.applicant.phone} · 제출 {selected.submittedAt}
                    </div>
                  </div>
                </div>

                {/* 서류 리스트 */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">제출 서류</div>
                  <div className="mt-3 space-y-2">
                    {selected.docs.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm text-slate-900">{d.name}</div>
                          <div className="text-[11px] text-slate-500">PDF</div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            열기
                          </a>
                          <button
                            type="button"
                            className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                            onClick={() => {
                              // ✅ docs.kind에 따라 미리보기 변경
                              if (d.kind === "application") setPreview("application");
                              else setPreview("survey");
                            }}
                          >
                            미리보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ✅ 미리보기(실제 이미지) */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">미리보기</div>
                    <div className="text-xs text-slate-500">{meta.title}</div>
                  </div>

                  {/* 탭 전환(선택) */}
                  <div className="mt-3 flex gap-2">
                    {(["survey", "application"] as const).map((k) => {
                      const active = preview === k;
                      const t = previewMeta(k).title;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setPreview(k)}
                          className={[
                            "rounded-xl border px-3 py-2 text-xs transition",
                            active
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={meta.img}
                        alt={`${meta.title} 미리보기`}
                        className="h-full w-full object-contain"
                        draggable={false}
                      />
                      <div className="border-t border-slate-200 px-3 py-2 text-center text-xs text-slate-600">
                        {meta.title}
                      </div>
                    </div>

                    {/* 두 번째 칸은 “다음 페이지” 느낌 placeholder로 남김 (원하면 제거 가능) */}
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-500">
                      다음 페이지 / PDF 렌더링 영역
                    </div>
                  </div>
                </div>

                {/* 처리 버튼 */}
                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">처리</div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onApprove}
                      disabled={selected.status !== "대기"}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        selected.status === "대기"
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "cursor-not-allowed bg-slate-200 text-slate-500",
                      ].join(" ")}
                    >
                      승인하기
                    </button>

                    <button
                      type="button"
                      onClick={onReject}
                      disabled={selected.status !== "대기"}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        selected.status === "대기"
                          ? "bg-red-600 text-white hover:bg-red-500"
                          : "cursor-not-allowed bg-slate-200 text-slate-500",
                      ].join(" ")}
                    >
                      반려하기
                    </button>
                  </div>

                  {/* 반려 사유 */}
                  <div className="mt-2">
                    <label className="text-xs font-medium text-slate-700">반려 사유</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="반려 사유를 입력하세요 (예: 주거 환경 확인 필요, 서류 누락 등)"
                      className="mt-2 h-24 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-900"
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      * 반려 처리는 기록으로 남습니다.
                    </div>
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
