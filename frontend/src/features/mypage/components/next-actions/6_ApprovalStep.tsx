import { useState } from "react";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

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

export function ApprovalStep() {
  // 프론트-only 더미 상태
  const [status] = useState<ApprovalStatus>("PENDING");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 허가</p>
            <p className="mt-1 text-sm text-gray-500">
              이 단계는 조회만 가능합니다. 승인 시 입양 후 단계로 넘어갑니다.
            </p>
          </div>

          <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${badge(status)}`}>
            {label(status)}
          </span>
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          {status === "APPROVED" && (
            <p>✅ 승인되었습니다. 이제 “입양 후” 단계로 진행합니다.</p>
          )}
          {status === "REJECTED" && (
            <p>❌ 반려되었습니다. 상세 사유는 보호소 안내를 확인하세요. (현재는 조회만)</p>
          )}
          {status === "PENDING" && (
            <p>⏳ 현재 심사중입니다. 결과가 나오면 이 화면에서 확인할 수 있습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
