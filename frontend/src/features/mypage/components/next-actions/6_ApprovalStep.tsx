import { useMemo, useState } from "react";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
type ViewState = "LOCKED" | "ACTIVE";

type Props = {
  /** ✅ 5단계(입양 계약서) 제출 완료 여부 */
  canReview: boolean;
  /** (선택) 잠김 상태에서 안내할 이전 단계명 */
  requiredStepLabel?: string; // 예: "5단계 · 입양 계약서"
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

export function ApprovalStep({ canReview, requiredStepLabel = "5단계 · 입양 계약서" }: Props) {
  // 프론트-only 더미 상태 (심사 가능한 상태에서만 의미 있음)
  const [status] = useState<ApprovalStatus>("PENDING");

  const viewState: ViewState = useMemo(() => (canReview ? "ACTIVE" : "LOCKED"), [canReview]);

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
              {status === "APPROVED" && <p>✅ 승인되었습니다. 이제 “입양 후” 단계로 진행합니다.</p>}
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
