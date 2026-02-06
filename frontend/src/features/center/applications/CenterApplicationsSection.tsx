import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { STATUS_FILTERS } from "./utils/labels";
import { useCenterApplications } from "./hooks/useCenterApplications";
import { ApplicationsLayout } from "./components";

export function CenterApplicationsSection() {
  const {
    // filters + list
    filter,
    setFilter,
    apps,
    totalCount,
    loading,
    listError,
    selectedAdoptionId,
    setSelectedAdoptionId,
    selected,

    // detail
    detail,
    detailLoading,
    detailError,
    currentProcessStatus,
    currentFinalStatus,

    // actions (final)
    canVerify,
    actionLoading,
    actionError,
    actionMessage,
    actionDisabled,
    handleApprove,
    openRejectModal,

    // reject modal
    isRejectModalOpen,
    rejectReason,
    setRejectReason,
    rejectError,
    handleReject,
    closeRejectModal,

    // step expand
    selectedStepOrder,
    stepDetail,
    stepDetailLoading,
    stepDetailError,
    toggleStep,
    handleStepApprove,
    handleStepRejectQuick,
  } = useCenterApplications();

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">입양 신청</CardTitle>
            <CardDescription className="text-sm text-slate-600 mt-2">
              보호소 강아지 입양 신청을 단계별로 조회하고 승인/반려를 처리합니다.
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

        <ApplicationsLayout
          // list
          apps={apps}
          totalCount={totalCount}
          loading={loading}
          listError={listError}
          selectedAdoptionId={selectedAdoptionId}
          onSelectAdoption={setSelectedAdoptionId}
          // detail header
          selected={selected}
          detail={detail}
          detailLoading={detailLoading}
          detailError={detailError}
          currentProcessStatus={currentProcessStatus}
          currentFinalStatus={currentFinalStatus}
          // step expand
          selectedStepOrder={selectedStepOrder}
          stepDetail={stepDetail}
          stepDetailLoading={stepDetailLoading}
          stepDetailError={stepDetailError}
          onToggleStep={toggleStep}
          onStepApprove={handleStepApprove}
          onStepReject={handleStepRejectQuick}
          // final actions
          canVerify={canVerify}
          actionLoading={actionLoading}
          actionDisabled={actionDisabled}
          onFinalApprove={handleApprove}
          onOpenRejectModal={openRejectModal}
        />

        {isRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">반려 사유 입력</h3>
              <p className="mt-2 text-sm text-slate-600">
                반려 사유를 입력해 주세요. 사유는 신청자에게 안내될 수 있습니다.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
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
      </CardContent>
    </Card>
  );
}
