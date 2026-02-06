import { useMemo, useState } from "react";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type ViewState = "LOCKED" | "ACTIVE";

type Props = {
  /** ✅ 5단계(입양 계약서) 제출 완료 여부 */
  canReview: boolean;

  /** ✅ 서버에서 받은 심사 상태(권장). 없으면 기존 더미 상태 사용 */
  approvalStatus?: ApprovalStatus;

  /** ✅ 서버 processStatus 기준 승인 완료 처리 */
  processStatus?: string | null;

  /** (선택) 잠김 상태에서 안내할 이전 단계명 */
  requiredStepLabel?: string; // 예: "5단계 · 입양 계약서"

  /** ✅ 승인 완료 화면: 입양 후 단계로 이동 버튼 */
  onGoAfterStage?: () => void;

  /** ✅ 하단 이전 단계로 버튼 */
  onGoPrev?: () => void;
};

function badge(status: ApprovalStatus) {
  if (status === "APPROVED") return "bg-green-50 text-green-700 border-green-200";
  if (status === "REJECTED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-50 text-gray-700 border-gray-200";
}

function label(status: ApprovalStatus) {
  if (status === "APPROVED") return "승인됨";
  if (status === "REJECTED") return "반려됨";
  return "심사중";
}

function lockedBadge() {
  return "bg-amber-50 text-amber-800 border-amber-200";
}

/** ✅ 업로드된 이미지(승인 완료) UI를 컴포넌트로 분리 */
function ApprovedSuccessView() {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      {/* 본문(중앙 정렬) */}
      <div className="px-6 py-14 sm:px-10">
        <div className="flex flex-col items-center text-center">
          {/* 타이틀 */}
          <h3 className="text-3xl sm:text-4xl font-extrabold text-emerald-900">
            심사 신청이 승인되었습니다
          </h3>

          {/* 설명 */}
          <p className="mt-4 text-base sm:text-lg text-gray-500">
            축하합니다! 보호소의 입양 심사가 승인되어 입양 후 단계로 이동합니다.
          </p>

        </div>
      </div>
    </div>
  );
}

export function ApprovalStep({
  canReview,
  approvalStatus,
  processStatus,
  requiredStepLabel = "5단계 · 입양 계약서",
}: Props) {
  const viewState: ViewState = useMemo(() => (canReview ? "ACTIVE" : "LOCKED"), [canReview]);

  const isApprovedByProcess = processStatus === "COMPLETED";
  const isApprovedByStatus = approvalStatus === "APPROVED";
  const isApproved = isApprovedByProcess || isApprovedByStatus;

  // ✅ 승인 완료면: 업로드 이미지 UI로 교체 렌더링
  if (viewState === "ACTIVE" && isApproved) {
    return <ApprovedSuccessView />;
  }

  // ✅ 서버 값이 없으면 기존 더미를 사용(개발 편의)
  const [dummyStatus] = useState<ApprovalStatus>("PENDING");
  const status: ApprovalStatus =
    approvalStatus ?? (isApprovedByProcess ? "APPROVED" : dummyStatus);

  // 기존 화면(심사중/반려/잠김)
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 허가</p>

            {viewState === "ACTIVE" ? (
              <p className="mt-1 text-sm text-gray-500">
                이 단계는 조회만 가능합니다. 승인 시 입양 후 단계로 넘어갑니다.
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                아직 심사가 시작되지 않았습니다. 이전 단계를 먼저 완료해야 합니다.
              </p>
            )}
          </div>

          {viewState === "ACTIVE" ? (
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge(
                status
              )}`}
            >
              {label(status)}
            </span>
          ) : (
            <span
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${lockedBadge()}`}
            >
              대기
            </span>
          )}
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {viewState === "LOCKED" && (
            <div className="space-y-2">
              <p>🔒 아직 심사 단계에 진입할 수 없습니다.</p>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">{requiredStepLabel}</span> 제출이 완료되어야
                심사가 진행됩니다.
              </p>
              <p className="text-gray-600">➡️ 이전 단계로 돌아가 제출을 완료해 주세요.</p>
            </div>
          )}

          {viewState === "ACTIVE" && (
            <>
              {status === "REJECTED" && (
                <p>❌ 반려되었습니다. 상세 사유는 보호소 안내를 확인하세요. (현재는 조회만)</p>
              )}
              {status === "PENDING" && (
                <p>⏳ 현재 심사중입니다. 결과가 나오면 이 화면에서 확인할 수 있습니다.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
