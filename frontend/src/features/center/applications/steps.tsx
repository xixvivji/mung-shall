import * as React from "react";
import { Badge } from "@/shared/ui/badge";
import type { ShelterDogWithAdoptionItem, ShelterAdoptionDetail, AdoptionEducationCertResponse } from "../api/centerApplicationsApi";
import { stepNameByOrder, stepBadgeVariant, stepStatusLabel } from "./utils/labels";
import { formatDateTime } from "./utils/format";

type Props = {
  selected: ShelterDogWithAdoptionItem;
  detail: ShelterAdoptionDetail | null;

  selectedStepOrder: number | null;
  stepDetail: AdoptionEducationCertResponse | null;
  stepDetailLoading: boolean;
  stepDetailError: string | null;

  onToggleStep: (order: number) => void;
  onStepApprove: () => void;
  onStepReject: () => void;

  actionLoading: boolean;
};

export function StepList({
  selected,
  detail,
  selectedStepOrder,
  stepDetail,
  stepDetailLoading,
  stepDetailError,
  onToggleStep,
  onStepApprove,
  onStepReject,
  actionLoading,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">입양 단계</div>
      </div>

      {detail?.steps?.length ? (
        <div className="mt-3 space-y-2">
          {detail.steps.map((s, idx) => {
            const order = idx + 1;
            const status = String(s.status).toUpperCase();
            const isSubmitted = status === "SUBMITTED";
            const isExpanded = selectedStepOrder === order;

            const leftLabel = `${order}단계 · ${stepNameByOrder(order)}`;

            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  disabled={!isSubmitted}
                  onClick={() => {
                    if (!isSubmitted) return;
                    onToggleStep(order);
                  }}
                  className={[
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition",
                    isSubmitted ? "hover:bg-slate-50" : "opacity-70 cursor-not-allowed",
                    isExpanded ? "border border-slate-900" : "",
                  ].join(" ")}
                >
                  <div className="text-sm text-slate-900">{leftLabel}</div>
                  <Badge variant={stepBadgeVariant(String(s.status)) as any}>{stepStatusLabel(s.status)}</Badge>
                </button>

                {isSubmitted && isExpanded ? (
                  <div className="border-t border-slate-200 px-3 py-3">
                    {stepDetailLoading ? (
                      <div className="text-xs text-slate-500">불러오는 중...</div>
                    ) : stepDetailError ? (
                      <div className="text-xs text-red-600">{stepDetailError}</div>
                    ) : order !== 2 ? (
                      <div className="text-xs text-slate-500">현재는 2단계(교육 수료증)만 제출 데이터 조회를 지원합니다.</div>
                    ) : stepDetail ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">교육 기관</span>
                          <span className="text-slate-900">{stepDetail.educationInstitution || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">수료증 번호</span>
                          <span className="text-slate-900">{stepDetail.certificateNumber || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-slate-500">수료일</span>
                          <span className="text-slate-900">{formatDateTime(stepDetail.completionDate) || "-"}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">파일</span>
                          {stepDetail.certificateFileUrl ? (
                            <a
                              href={stepDetail.certificateFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-slate-900 underline"
                            >
                              수료증 열기
                            </a>
                          ) : (
                            <span className="text-slate-900">-</span>
                          )}
                        </div>

                        <div className="pt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={onStepApprove}
                            className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500"
                          >
                            승인
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={onStepReject}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:bg-red-200 disabled:text-red-400"
                          >
                            반려
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">제출 데이터가 없습니다.</div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">단계 정보가 없습니다.</div>
      )}
    </div>
  );
}
