import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ApiError } from "@/shared/api/client";
import {
  getShelterDogsWithAdoption,
  getShelterAdoptionDetail,
  verifyShelterAdoption,
  type AdoptionProcessStatus,
  type ShelterDogWithAdoptionItem,
  type ShelterAdoptionDetail,
  type AdoptionFinalStatus,
} from "../api/centerApplicationsApi";

const STATUS_FILTERS: Array<{ value: AdoptionProcessStatus; label: string }> = [
  { value: "IN_PROGRESS", label: "진행중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

const PROCESS_STATUS_LABELS: Record<AdoptionProcessStatus, string> = {
  IN_PROGRESS: "진행중",
  COMPLETED: "완료",
  CANCELLED: "취소",
};

function processBadgeVariant(status: AdoptionProcessStatus) {
  if (status === "COMPLETED") return "default";
  if (status === "CANCELLED") return "destructive";
  return "secondary";
}

function finalStatusLabel(status?: AdoptionFinalStatus | null) {
  if (!status) return "-";
  const s = String(status).toUpperCase();
  if (s === "APPROVED") return "최종 승인";
  if (s === "REJECTED") return "최종 반려";
  if (s === "WAITING" || s === "PENDING") return "대기";
  return s;
}

function resolveApiErrorMessage(err: unknown, fallback = "요청에 실패했습니다.") {
  if (err instanceof ApiError) {
    if (err.status === 401) return "보호소 계정으로 로그인해 주세요.";
    if (err.status === 403) return "보호소 권한이 없습니다.";
    if (err.status === 404) return "대상을 찾을 수 없습니다.";
    if (err.status === 409) return "이미 처리된 항목입니다. 최신 상태를 확인해 주세요.";
    if (err.status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    return err.message || fallback;
  }
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

export function CenterApplicationsSection() {
  const [apps, setApps] = React.useState<ShelterDogWithAdoptionItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);

  const [selectedAdoptionId, setSelectedAdoptionId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<ShelterAdoptionDetail | null>(null);
  const [filter, setFilter] = React.useState<AdoptionProcessStatus>("IN_PROGRESS");

  const [loading, setLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);

  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async (activeFilter: AdoptionProcessStatus) => {
    setLoading(true);
    setListError(null);

    try {
      const res = await getShelterDogsWithAdoption(activeFilter);

      setApps(res.dogsWithAdoption);
      setTotalCount(res.totalCount);

      setSelectedAdoptionId((prev) => {
        if (prev && res.dogsWithAdoption.some((item) => item.adoptionId === prev)) return prev;
        return res.dogsWithAdoption[0]?.adoptionId ?? null;
      });

      return res.dogsWithAdoption;
    } catch (err) {
      setApps([]);
      setTotalCount(0);
      setSelectedAdoptionId(null);
      setListError(resolveApiErrorMessage(err, "목록을 불러오지 못했습니다."));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshList(filter);
  }, [filter, refreshList]);

  React.useEffect(() => {
    if (!selectedAdoptionId) {
      setDetail(null);
      setDetailError(null);
      return;
    }

    let active = true;
    setDetailLoading(true);
    setDetailError(null);

    getShelterAdoptionDetail(selectedAdoptionId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
      })
      .catch((err) => {
        if (!active) return;
        setDetail(null);
        setDetailError(resolveApiErrorMessage(err, "상세 정보를 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!active) return;
        setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedAdoptionId]);

  React.useEffect(() => {
    setActionError(null);
    setActionMessage(null);
  }, [selectedAdoptionId, filter]);

  const selected = React.useMemo(
    () => apps.find((a) => a.adoptionId === selectedAdoptionId) ?? null,
    [apps, selectedAdoptionId]
  );

  // ✅ “검증 가능” 조건: 진행중 + 최종 상태 확정(승인/반려) 전
  const currentDetail = detail;
  const currentProcessStatus = currentDetail?.processStatus ?? selected?.adoptionProcessStatus ?? filter;
  const currentFinalStatus = (currentDetail?.status ?? null) as AdoptionFinalStatus | null;

  const canVerify =
    currentDetail?.processStatus === "IN_PROGRESS" &&
    currentFinalStatus !== "APPROVED" &&
    currentFinalStatus !== "REJECTED";

  const actionDisabled = actionLoading || !selected || !canVerify;

  const handleApprove = async () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    const confirmed = window.confirm("해당 입양을 최종 승인 처리할까요?");
    if (!confirmed) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoption(selected.adoptionId, {
        isApproved: true,
        rejectionReason: "",
      });

      setActionMessage("승인 처리가 완료되었습니다.");
      await refreshList(filter);

      const next = await getShelterAdoptionDetail(selected.adoptionId);
      setDetail(next);
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    setRejectReason("");
    setRejectError(null);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (actionLoading) return;
    setIsRejectModalOpen(false);
    setRejectReason("");
    setRejectError(null);
  };

  const handleReject = async () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("반려 사유를 입력해주세요.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoption(selected.adoptionId, {
        isApproved: false,
        rejectionReason: reason,
      });

      setActionMessage("반려 처리가 완료되었습니다.");
      setIsRejectModalOpen(false);
      setRejectReason("");

      await refreshList(filter);

      const next = await getShelterAdoptionDetail(selected.adoptionId);
      setDetail(next);
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const listCountLabel = totalCount || apps.length;

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">입양 신청</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              보호소 강아지 입양 목록을 진행 상태별로 조회하고 최종 승인/반려를 처리합니다.
            </CardDescription>
          </div>

          <div className="flex gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm transition",
                  filter === item.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {actionError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        ) : null}
        {actionMessage ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {actionMessage}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          {/* 왼쪽: 목록 */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3 text-sm font-medium text-slate-900">
              입양 목록 ({listCountLabel})
            </div>

            <div className="max-h-[520px] overflow-auto p-2">
              {loading ? (
                <div className="p-6 text-sm text-slate-500">목록을 불러오는 중...</div>
              ) : listError ? (
                <div className="p-6 text-sm text-red-600">{listError}</div>
              ) : apps.length === 0 ? (
                <div className="p-6 text-sm text-slate-500">현재 항목이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {apps.map((item) => {
                    const active = item.adoptionId === selectedAdoptionId;

                    return (
                      <button
                        key={item.adoptionId}
                        type="button"
                        onClick={() => setSelectedAdoptionId(item.adoptionId)}
                        className={[
                          "w-full rounded-2xl border p-3 text-left transition",
                          active
                            ? "border-slate-900 bg-slate-900/5"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs text-slate-500">
                            {item.dogImageUrl ? (
                              <img
                                src={item.dogImageUrl}
                                alt="dog"
                                className="h-full w-full object-cover"
                                draggable={false}
                              />
                            ) : (
                              "No Image"
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {item.applicantUsername}
                              </div>

                              <Badge variant={processBadgeVariant(item.adoptionProcessStatus) as any}>
                                {PROCESS_STATUS_LABELS[item.adoptionProcessStatus]}
                              </Badge>
                            </div>

                            <div className="mt-0.5 truncate text-xs text-slate-600">
                              {item.abandonedDogKindNm} · desertionNo {item.abandonedDogDesertionNo}
                            </div>

                            <div className="mt-0.5 text-[11px] text-slate-500">
                              현재 단계: {item.currentStepName || "-"} ({String(item.currentStepStatus)}) · order{" "}
                              {item.currentStepOrder ?? "-"}
                            </div>

                            <div className="mt-0.5 text-[11px] text-slate-500">
                              전화 {item.applicantUserPhone}
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

          {/* 오른쪽: 상세 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {!selected ? (
              <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
                항목을 선택해주세요.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {detailLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                    상세 정보를 불러오는 중...
                  </div>
                ) : null}
                {detailError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                    {detailError}
                  </div>
                ) : null}

                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-xs text-slate-500">
                    {selected.dogImageUrl ? (
                      <img
                        src={selected.dogImageUrl}
                        alt="dog"
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                    ) : (
                      "No Image"
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {(detail?.userName ?? selected.applicantUsername) + " 신청"}
                      </div>

                      <Badge variant={processBadgeVariant(currentProcessStatus) as any}>
                        {PROCESS_STATUS_LABELS[currentProcessStatus]}
                      </Badge>

                      <Badge
                        variant={
                          finalStatusLabel(currentFinalStatus).includes("반려")
                            ? ("destructive" as any)
                            : ("secondary" as any)
                        }
                      >
                        {finalStatusLabel(currentFinalStatus)}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-slate-700">
                      {selected.abandonedDogKindNm} · desertionNo {selected.abandonedDogDesertionNo}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      신청자ID {detail?.userId ?? selected.applicantUserId} · 이메일{" "}
                      {selected.applicantUserEmail || "-"} · 전화 {selected.applicantUserPhone}
                    </div>

                    {detail?.rejectionReason ? (
                      <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                        반려 사유: {detail.rejectionReason}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* 단계 정보 (스웨거 steps) */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">입양 단계</div>
                  </div>

                  {detail?.steps?.length ? (
                    <div className="mt-3 space-y-2">
                      {detail.steps.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <div className="text-sm text-slate-900">Step #{s.id}</div>
                          <div className="text-xs text-slate-600">{String(s.status)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                      단계 정보가 없습니다.
                    </div>
                  )}
                </div>

                {/* 처리 */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">처리</div>
                    {actionLoading ? <span className="text-xs text-slate-500">처리 중...</span> : null}
                  </div>

                  {!canVerify && (
                    <p className="mt-2 text-xs text-slate-500">
                      진행중 상태에서만 최종 승인/반려를 처리할 수 있습니다.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionDisabled}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        actionDisabled
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-slate-900 text-white hover:bg-slate-800",
                      ].join(" ")}
                    >
                      {actionLoading ? "승인 중..." : "최종 승인"}
                    </button>

                    <button
                      type="button"
                      onClick={openRejectModal}
                      disabled={actionDisabled}
                      className={[
                        "rounded-xl px-3 py-2 text-sm font-medium transition",
                        actionDisabled
                          ? "cursor-not-allowed bg-slate-200 text-slate-500"
                          : "bg-red-600 text-white hover:bg-red-500",
                      ].join(" ")}
                    >
                      {actionLoading ? "반려 중..." : "최종 반려"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">반려 사유 입력</h3>
            <p className="mt-2 text-sm text-slate-600">
              반려 사유를 입력해 주세요. 사유는 신청자에게 안내될 수 있습니다.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (rejectError) setRejectError(null);
              }}
              placeholder="반려 사유를 입력하세요."
              className="mt-4 h-28 w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-900"
              disabled={actionLoading}
            />

            {rejectError ? <p className="mt-2 text-xs text-red-600">{rejectError}</p> : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500 disabled:bg-red-300"
              >
                {actionLoading ? "처리 중..." : "반려 처리"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
