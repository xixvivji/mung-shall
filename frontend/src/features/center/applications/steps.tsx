import * as React from "react";
import { Badge } from "@/shared/ui/badge";
import type {
  ShelterAdoptionDetail,
  AdoptionSurveyResponse,
  AdoptionEducationCertResponse,
  AdoptionContractResponse,
  AdoptionDocumentType,
  UploadedDocumentResponse,
} from "../api/centerApplicationsApi";
import { stepNameByOrder, stepBadgeVariant, stepStatusLabel } from "./utils/labels";
import { formatDateTime } from "./utils/format";

export type StepDetailData =
  | { kind: "survey"; data: AdoptionSurveyResponse }
  | { kind: "educationCert"; data: AdoptionEducationCertResponse }
  | { kind: "meeting"; data: { stepInstanceId: number } }
  | { kind: "documents"; data: { type: AdoptionDocumentType; doc: UploadedDocumentResponse | null }[] }
  | { kind: "contract"; data: AdoptionContractResponse }
  | null;

type Props = {
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

function formatFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function documentTypeLabel(t: AdoptionDocumentType) {
  switch (t) {
    case "RESIDENT_REGISTRATION_COPY":
      return "주민등록등본";
    case "LEASE_AGREEMENT":
      return "임대차계약서";
    case "FAMILY_RELATIONSHIP_CERTIFICATE":
      return "가족관계증명서";
    default:
      return String(t);
  }
}

export function StepList({
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

            // ✅ 지금 서버에서는 IN_PROGRESS 안 온다고 했으니 SUBMITTED 이상만 열기
            const isOpenable = ["SUBMITTED", "APPROVED", "REJECTED", "COMPLETED"].includes(status);

            // ✅ 기본 승인/반려 가능 조건:
            // - 1/2/4/5 단계: SUBMITTED일 때만 (4단계는 아래 documents 블록에서 "3개 제출" 추가 제어)
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

                {isOpenable && isExpanded ? (
                  <div className="border-t border-slate-200 px-3 py-3">
                    {stepDetailLoading ? (
                      <div className="text-xs text-slate-500">불러오는 중...</div>
                    ) : stepDetailError ? (
                      <div className="text-xs text-red-600">{stepDetailError}</div>
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
                    ) : stepDetail.kind === "meeting" ? (
                      <div className="space-y-2 text-sm">
                        <div className="text-xs text-slate-500">상담 단계입니다. 제출 데이터 조회는 없습니다.</div>

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
                    ) : stepDetail.kind === "documents" ? (
                      (() => {
                        const total = stepDetail.data.length; // 보통 3
                        const submittedDocs = stepDetail.data.filter((x) => Boolean(x.doc));
                        const submittedCount = submittedDocs.length;

                        // ✅ 4단계 승인/반려는 "3개 모두 제출"일 때만
                        const allSubmitted = total > 0 && submittedCount === total;
                        const canActionHere = isActionable && allSubmitted;

                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-500">제출된 입양 문서</div>
                              <div className="text-xs text-slate-500">
                                제출 {submittedCount}/{total}
                              </div>
                            </div>

                            {/* ✅ 1개라도 제출되면(=step SUBMITTED) 제출된 파일 "조회 가능" → 여기 리스트에 노출됨 */}
                            {submittedDocs.length === 0 ? (
                              <div className="text-xs text-slate-500">제출된 문서가 없습니다.</div>
                            ) : (
                              <ul className="space-y-2">
                                {submittedDocs.map(({ type, doc }) => (
                                  <li key={type} className="rounded-xl border border-slate-200 p-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <div className="text-sm font-medium text-slate-900 truncate">
                                            {documentTypeLabel(type)}
                                          </div>
                                          <Badge variant={"secondary" as any}>제출완료</Badge>
                                        </div>

                                        <div className="mt-1 text-xs text-slate-700 truncate">
                                          {doc?.originalFileName || "-"}
                                        </div>
                                        <div className="mt-0.5 text-xs text-slate-500">
                                          크기: {formatFileSize(doc?.fileSize)}
                                        </div>
                                      </div>

                                      {doc?.filePath ? (
                                        <a
                                          href={doc.filePath}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="shrink-0 text-sm text-slate-900 underline"
                                        >
                                          열기
                                        </a>
                                      ) : null}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* ✅ 3개 미만이면 버튼 숨기고 안내 */}
                            {isActionable && !allSubmitted ? (
                              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                                문서 {total}개가 모두 제출되어야 승인/반려가 가능합니다.
                              </div>
                            ) : null}

                            {/* ✅ 3개 모두 제출 시에만 승인/반려 버튼 */}
                            {canActionHere ? (
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
                    ) : stepDetail.kind === "contract" ? (
                      (() => {
                        const c = stepDetail.data;
                        return (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-500">파일명</span>
                              <span className="text-slate-900">{c.originalFileName || "-"}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">파일 크기</span>
                              <span className="text-slate-900">{formatFileSize(c.fileSize)}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-slate-500">업로드 일시</span>
                              <span className="text-slate-900">{formatDateTime(c.uploadedAt) || "-"}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-slate-500">파일</span>
                              {c.contractFileUrl ? (
                                <a
                                  href={c.contractFileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-slate-900 underline"
                                >
                                  계약서 열기
                                </a>
                              ) : (
                                <span className="text-slate-900">-</span>
                              )}
                            </div>

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
