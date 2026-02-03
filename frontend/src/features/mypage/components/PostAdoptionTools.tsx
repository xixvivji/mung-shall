import { useCallback, useEffect, useMemo, useState } from "react";
import { VideoCallModal } from "@/features/video-call";
import { Button } from "@/shared/ui/button";
import { CheckCircle2, Circle, Video, Calendar } from "lucide-react";
import { ApiError } from "@/shared/api/client";
import {
  fetchPostAdoptionStep,
  verifyPostAdoptionStep,
  completePostAdoptionProcess,
} from "@/features/postAdoption/api/postAdoptionApi";
import type { PostAdoptionStep, PostAdoptionStepStatus } from "@/features/mypage/types";

type Props = {
  postAdoptionId?: number | null;
  adoptionId?: number | null;
  steps?: PostAdoptionStep[];
  onRefresh?: () => void | Promise<void>;
  onStart?: () => void | Promise<void>;
};

const STATUS_LABELS: Record<PostAdoptionStepStatus, string> = {
  NOT_STARTED: "???",
  PENDING: "??",
  SUBMITTED: "???",
  COMPLETED: "??",
  REJECTED: "??",
  CANCELLED: "??",
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "???? ?????.";
    if (error.status === 403) return "??? ????.";
    if (error.status === 404) return "?? ??? ?? ? ????.";
    if (error.status === 409) return "?? ??? ?????. ?? ??? ?????.";
    if (error.status >= 500) return "?? ??? ??????. ?? ? ?? ??????.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function PostAdoptionTools({
  postAdoptionId,
  adoptionId,
  steps,
  onRefresh,
  onStart,
}: Props) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [detail, setDetail] = useState<PostAdoptionStep | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  const orderedSteps = useMemo(() => {
    if (!steps) return [];
    return [...steps].sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0));
  }, [steps]);

  useEffect(() => {
    if (!orderedSteps.length) {
      setSelectedStepId(null);
      return;
    }
    if (!selectedStepId || !orderedSteps.some((step) => step.id === selectedStepId)) {
      setSelectedStepId(orderedSteps[0]?.id ?? null);
    }
  }, [orderedSteps, selectedStepId]);

  useEffect(() => {
    setActionError(null);
    setActionMessage(null);
    setRejectReason("");
  }, [selectedStepId]);

  useEffect(() => {
    setCompleteError(null);
    setCompleteMessage(null);
  }, [postAdoptionId]);

  const loadDetail = useCallback(
    async (targetId: number, stepId: number) => {
      setDetailLoading(true);
      setDetailError(null);
      try {
        const data = await fetchPostAdoptionStep(targetId, stepId);
        if (!data) {
          setDetail(null);
          setDetailError("?? ??? ?? ? ????.");
          return;
        }
        setDetail(data);
      } catch (err) {
        setDetail(null);
        setDetailError(resolveApiErrorMessage(err, "?? ?? ??? ???? ?????."));
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!postAdoptionId || !selectedStepId) {
      setDetail(null);
      return;
    }
    void loadDetail(postAdoptionId, selectedStepId);
  }, [postAdoptionId, selectedStepId, loadDetail]);

  const handleVerify = async (approved: boolean) => {
    if (!postAdoptionId || !selectedStepId) return;
    if (!detail) return;
    if (!canVerify) return;

    if (!approved && !rejectReason.trim()) {
      setActionError("?? ??? ??????.");
      return;
    }

    const confirmed = window.confirm(
      approved ? "?? ??? ?? ??????" : "?? ??? ?? ??????"
    );
    if (!confirmed) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyPostAdoptionStep(postAdoptionId, selectedStepId, {
        isApproved: approved,
        rejectionReason: approved ? "" : rejectReason.trim(),
      });
      setActionMessage(approved ? "?? ??? ???????." : "?? ??? ???????.");
      setRejectReason("");
      await loadDetail(postAdoptionId, selectedStepId);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setActionError(resolveApiErrorMessage(err, "??/?? ??? ??????."));
      if (err instanceof ApiError && err.status === 409) {
        await loadDetail(postAdoptionId, selectedStepId);
        if (onRefresh) {
          await onRefresh();
        }
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartProcess = async () => {
    if (!onStart || !adoptionId) return;
    setCompleteError(null);
    setCompleteMessage(null);
    try {
      await onStart();
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setCompleteError(resolveApiErrorMessage(err, "입양 후 프로세스를 시작하지 못했습니다."));
    }
  };

  const handleCompleteProcess = async () => {
    if (!postAdoptionId || completeLoading) return;
    const confirmed = window.confirm("입양 후 프로세스를 완료 처리할까요?");
    if (!confirmed) return;

    setCompleteLoading(true);
    setCompleteError(null);
    setCompleteMessage(null);

    try {
      await completePostAdoptionProcess(postAdoptionId);
      setCompleteMessage("입양 후 프로세스가 완료 처리되었습니다.");
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setCompleteError(resolveApiErrorMessage(err, "완료 처리에 실패했습니다."));
    } finally {
      setCompleteLoading(false);
    }
  };

  const canVerify = detail
    ? detail.status === "PENDING" || detail.status === "SUBMITTED"
    : false;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Roadmap Checklist */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl text-gray-400 mb-8">?? ? ???</h2>

        <div className="space-y-4">
          {!postAdoptionId && (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              ?? ? ???? ID? ????. ?? ??? ???.
              {onStart && adoptionId ? (
                <div className="mt-3">
                  <Button
                    variant="outline"
                    className="rounded-lg"
                    onClick={handleStartProcess}
                  >
                    입양 후 프로세스 시작
                  </Button>
                </div>
              ) : null}
            </div>
          )}

          {postAdoptionId && orderedSteps.length === 0 && (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              ?? ? ??? ????.
            </div>
          )}

          {orderedSteps.map((step) => {
            const completed = step.status === "COMPLETED";
            const selected = step.id === selectedStepId;
            return (
              <button
                key={step.id}
                type="button"
                className={`w-full text-left flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                  selected ? "border-blue-300 bg-blue-50/40" : "border-gray-100 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedStepId(step.id)}
              >
                {completed ? (
                  <CheckCircle2 className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-300 flex-shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={completed ? "text-gray-500 line-through" : "text-gray-900"}>
                      {step.stepName || "Post-adoption step"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                      {STATUS_LABELS[step.status] ?? step.status}
                    </span>
                  </div>
                  {step.description && (
                    <p className="mt-1 text-xs text-gray-500">{step.description}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">?? ??</p>
            {detailLoading ? <span className="text-xs text-gray-500">???? ?...</span> : null}
          </div>

          {detailError ? <p className="mt-2 text-xs text-red-600">{detailError}</p> : null}

          {!detailLoading && !detailError && !detail ? (
            <p className="mt-3 text-xs text-gray-500">??? ??????.</p>
          ) : null}

          {detail && (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">???</span>
                <span className="text-sm text-gray-900">{detail.stepName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">??</span>
                <span className="text-sm text-gray-900">
                  {STATUS_LABELS[detail.status] ?? detail.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">???</span>
                <span className="text-sm text-gray-900">{formatDateTime(detail.submittedAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">???</span>
                <span className="text-sm text-gray-900">{formatDateTime(detail.completedAt)}</span>
              </div>
              {detail.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  ?? ??: {detail.rejectionReason}
                </div>
              )}

              {actionError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {actionError}
                </div>
              ) : null}
              {actionMessage ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {actionMessage}
                </div>
              ) : null}
              {completeError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {completeError}
                </div>
              ) : null}
              {completeMessage ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {completeMessage}
                </div>
              ) : null}

              <div className="mt-2 space-y-2">
                <label className="text-xs font-semibold text-gray-600">?? ??</label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 bg-white p-2 text-xs"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={!canVerify || actionLoading}
                  placeholder="?? ??? ??????."
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  className="rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                  disabled={!canVerify || actionLoading}
                  onClick={() => handleVerify(true)}
                >
                  {actionLoading ? "?? ?..." : "??"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-lg"
                  disabled={!canVerify || actionLoading}
                  onClick={() => handleVerify(false)}
                >
                  ??
                </Button>
              </div>
              {!canVerify && detail && (
                <p className="text-xs text-gray-500">?? ??? ?????.</p>
              )}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full mt-6 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          onClick={handleCompleteProcess}
          disabled={!postAdoptionId || completeLoading}
        >
          {completeLoading ? "완료 처리 중..." : "전체 완료 처리"}
        </Button>
      </div>

      {/* Video Call Appointment */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-sm border border-blue-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-blue-400 flex items-center justify-center">
            <Video className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-gray-900 mb-1">화상 미팅 입장</h2>
            <p className="text-sm text-gray-600">담당자와 1:1 상담 진행</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">예약된 일정</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-semibold text-gray-900">2월 28일</span>
            <span className="text-gray-500">화요일</span>
          </div>
          <p className="text-lg text-blue-600">오후 2:00 - 2:30</p>
        </div>

        <Button className="w-full bg-blue-400 hover:bg-blue-500 text-white rounded-lg h-12" onClick={() => setIsVideoCallOpen(true)}>
          통화 입장하기
        </Button>

        <button className="w-full mt-3 text-sm text-blue-600 hover:text-blue-700">
          예약 변경하기
        </button>

        <VideoCallModal
          open={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          roomId={postAdoptionId ? String(postAdoptionId) : undefined}
        />
      </div>
    </div>
  );
}
