import * as React from "react";
import { Badge } from "@/shared/ui/badge";
import type {
  ShelterDogWithAdoptionItem,
  ShelterAdoptionDetail,
  AdoptionSurveyResponse,
  AdoptionEducationCertResponse,
} from "../api/centerApplicationsApi";
import { stepNameByOrder, stepBadgeVariant, stepStatusLabel } from "./utils/labels";
import { formatDateTime } from "./utils/format";

export type StepDetailData =
  | { kind: "survey"; data: AdoptionSurveyResponse }
  | { kind: "educationCert"; data: AdoptionEducationCertResponse }
  | null;

type Props = {
  selected: ShelterDogWithAdoptionItem;
  detail: ShelterAdoptionDetail | null;

  selectedStepOrder: number | null;
  stepDetail: StepDetailData;
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

            // ✅ 조회(열람) 가능한 상태: 제출됨/승인/반려/완료 모두
            const isOpenable = ["SUBMITTED", "APPROVED", "REJECTED", "COMPLETED"].includes(status);

            // ✅ 승인/반려 버튼은 제출됨일 때만
            const isActionable = status === "SUBMITTED";

            const isExpanded = selectedStepOrder === order;
            const leftLabel = `${order}단계 · ${stepNameByOrder(order)}`;

            return (
              <div key={s.id} className="rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  disabled={!isOpenable}
                  onClick={() => {
                    if (!isOpenable) return;
                    onToggleStep(order);
                  }}
                  className={[
                    "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition",
                    isOpenable ? "hover:bg-slate-50" : "opacity-70 cursor-not-allowed",
                    isExpanded ? "border border-slate-900" : "",
                  ].join(" ")}
                >
                  <div className="text-sm text-slate-900">{leftLabel}</div>
                  <Badge variant={stepBadgeVariant(String(s.status)) as any}>{stepStatusLabel(s.status)}</Badge>
                </button>

                {/* ✅ 열람 가능한 상태면 확장 영역 렌더 */}
                {isOpenable && isExpanded ? (
                  <div className="border-t border-slate-200 px-3 py-3">
                    {stepDetailLoading ? (
                      <div className="text-xs text-slate-500">불러오는 중...</div>
                    ) : stepDetailError ? (
                      <div className="text-xs text-red-600">{stepDetailError}</div>
                    ) : order !== 1 && order !== 2 ? (
                      <div className="text-xs text-slate-500">
                        현재는 1단계(설문), 2단계(교육 수료증)만 제출 데이터 조회를 지원합니다.
                      </div>
                    ) : !stepDetail ? (
                      <div className="text-xs text-slate-500">제출 데이터가 없습니다.</div>
                    ) : stepDetail.kind === "educationCert" ? (
                      (() => {
                        const cert = stepDetail.data;
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">교육 기관</span>
                              <span className="text-slate-900">{cert.educationInstitution || "-"}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">수료증 번호</span>
                              <span className="text-slate-900">{cert.certificateNumber || "-"}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">수료일</span>
                              <span className="text-slate-900">{formatDateTime(cert.completionDate) || "-"}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">파일</span>
                              {cert.certificateFileUrl ? (
                                <a
                                  href={cert.certificateFileUrl}
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

                            {/* ✅ 제출됨일 때만 승인/반려 노출 */}
                            {isActionable ? (
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
                            ) : null}
                          </div>
                        );
                      })()
                    ) : stepDetail.kind === "survey" ? (
                      (() => {
                        const survey = stepDetail.data;
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">이름</span>
                              <span className="text-slate-900">{survey.name || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">생년월일</span>
                              <span className="text-slate-900">{survey.dateOfBirth || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">전화번호</span>
                              <span className="text-slate-900">{survey.phoneNumber || "-"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">이메일</span>
                              <span className="text-slate-900">{survey.email || "-"}</span>
                            </div>

                            {/* 필요하면 더 추가 */}
                          </div>
                        );
                      })()
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
