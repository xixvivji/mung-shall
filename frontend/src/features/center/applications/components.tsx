import * as React from "react";
import { Badge } from "@/shared/ui/badge";
import type {
  AdoptionProcessStatus,
  ShelterDogWithAdoptionItem,
  ShelterAdoptionDetail,
  AdoptionFinalStatus,
} from "../api/centerApplicationsApi";
import { PROCESS_STATUS_LABELS, processBadgeVariant, finalStatusLabel } from "./utils/labels";
import { StepList, type StepDetailData } from "./steps";

type Props = {
  // list
  apps: ShelterDogWithAdoptionItem[];
  totalCount: number;
  loading: boolean;
  listError: string | null;
  selectedAdoptionId: number | null;
  onSelectAdoption: (id: number) => void;

  // detail
  selected: ShelterDogWithAdoptionItem | null;
  detail: ShelterAdoptionDetail | null;
  detailLoading: boolean;
  detailError: string | null;
  currentProcessStatus: AdoptionProcessStatus;
  currentFinalStatus: AdoptionFinalStatus | null;

  // step expand
  selectedStepOrder: number | null;
  stepDetail: StepDetailData;
  stepDetailLoading: boolean;
  stepDetailError: string | null;
  onToggleStep: (order: number) => void;
  onStepApprove: () => void;
  onStepReject: () => void;

  // final actions
  canVerify: boolean;
  actionLoading: boolean;
  actionDisabled: boolean;
  onFinalApprove: () => void;
  onOpenRejectModal: () => void;
};

/** ✅ StepList(입양 단계 카드) 안에 넣을 최종 버튼 영역 */
function FinalActions(props: {
  canVerify: boolean;
  actionLoading: boolean;
  actionDisabled: boolean;
  allStepsApproved: boolean; // ✅ 추가
  onFinalApprove: () => void;
  onOpenRejectModal: () => void;
}) {
  const { canVerify, actionLoading, actionDisabled, allStepsApproved, onFinalApprove, onOpenRejectModal } = props;

  // ✅ 최종 반려는 조건 없음(기존 actionDisabled만)
  const rejectDisabled = actionDisabled;

  // ✅ 최종 승인은 "1~5단계 모두 APPROVED"일 때만 활성
  // (canVerify/actionDisabled 같은 기존 정책은 그대로 유지)
  const approveDisabled = actionDisabled || !allStepsApproved;

  return (
    <div className="mt-4 flex flex-col items-end gap-2">
      {!canVerify && (
        <p className="text-xs text-slate-500">진행중 상태에서만 최종 승인/반려를 처리할 수 있습니다.</p>
      )}

      {/* ✅ 최종 승인 비활성 사유 안내(선택) */}
      {canVerify && !allStepsApproved ? (
        <p className="text-xs text-slate-500">1~5단계가 모두 승인 상태여야 최종 승인이 가능합니다.</p>
      ) : null}

      {actionLoading ? <span className="text-xs text-slate-500">처리 중...</span> : null}

      {/* ✅ 순서: 최종 반려 -> 최종 승인 */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={onOpenRejectModal}
          disabled={rejectDisabled}
          className={[
            "rounded-xl px-3 py-2 text-sm font-medium transition",
            rejectDisabled
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : "bg-red-600 text-white hover:bg-red-500",
          ].join(" ")}
        >
          {actionLoading ? "반려 중..." : "최종 반려"}
        </button>

        <button
          type="button"
          onClick={onFinalApprove}
          disabled={approveDisabled}
          className={[
            "rounded-xl px-3 py-2 text-sm font-medium transition",
            approveDisabled
              ? "cursor-not-allowed bg-slate-200 text-slate-500"
              : "bg-slate-900 text-white hover:bg-slate-800",
          ].join(" ")}
        >
          {actionLoading ? "승인 중..." : "최종 승인"}
        </button>
      </div>
    </div>
  );
}

export function ApplicationsLayout(props: Props) {
  const {
    apps,
    totalCount,
    loading,
    listError,
    selectedAdoptionId,
    onSelectAdoption,

    selected,
    detail,
    detailLoading,
    detailError,
    currentProcessStatus,
    currentFinalStatus,

    selectedStepOrder,
    stepDetail,
    stepDetailLoading,
    stepDetailError,
    onToggleStep,
    onStepApprove,
    onStepReject,

    canVerify,
    actionLoading,
    actionDisabled,
    onFinalApprove,
    onOpenRejectModal,
  } = props;

  const listCountLabel = totalCount || apps.length;

  /**
   * ✅ 1~5단계가 모두 APPROVED일 때만 최종 승인 활성화
   * - steps가 5개 미만이면 false
   * - status는 NOT_STARTED/PENDING/SUBMITTED/APPROVED/REJECTED 중 하나
   */
  const allStepsApproved = React.useMemo(() => {
    const steps = detail?.steps ?? [];
    if (steps.length < 5) return false;

    // 현재 UI가 idx+1을 order로 쓰는 전제와 동일하게 "앞 5개"를 1~5로 간주
    // (만약 서버가 정렬을 보장 안 하면 order 필드 기준으로 정렬해서 쓰는 걸 추천)
    const firstFive = steps.slice(0, 5);
    return firstFive.every((s) => String(s.status).toUpperCase() === "APPROVED");
  }, [detail?.steps]);

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      {/* 좌측 목록 */}
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
                    onClick={() => onSelectAdoption(item.adoptionId)}
                    className={[
                      "w-full rounded-2xl border p-3 text-left transition",
                      active ? "border-slate-900 bg-slate-900/5" : "border-slate-200 hover:bg-slate-50",
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

                        <div className="mt-0.5 text-[11px] text-slate-500">전화 {item.applicantUserPhone}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 우측 상세 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        {!selected ? (
          <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
            항목을 선택해주세요.
          </div>
        ) : (
          <div className="flex min-h-[520px] flex-col gap-4">
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

            {/* 상단 헤더 */}
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
                  신청자ID {detail?.userId ?? selected.applicantUserId} · 이메일 {selected.applicantUserEmail || "-"} ·
                  전화 {selected.applicantUserPhone}
                </div>

                {detail?.rejectionReason ? (
                  <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    반려 사유: {detail.rejectionReason}
                  </div>
                ) : null}
              </div>
            </div>

            {/* ✅ 단계 카드(=StepList) 안으로 최종 버튼을 "slot"으로 넣는다 */}
            <StepList
              detail={detail}
              selectedStepOrder={selectedStepOrder}
              stepDetail={stepDetail}
              stepDetailLoading={stepDetailLoading}
              stepDetailError={stepDetailError}
              onToggleStep={onToggleStep}
              onStepApprove={onStepApprove}
              onStepReject={onStepReject}
              actionLoading={actionLoading}
              footer={
                <FinalActions
                  canVerify={canVerify}
                  actionLoading={actionLoading}
                  actionDisabled={actionDisabled}
                  allStepsApproved={allStepsApproved}
                  onFinalApprove={onFinalApprove}
                  onOpenRejectModal={onOpenRejectModal}
                />
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
