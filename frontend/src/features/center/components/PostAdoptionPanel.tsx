// src/features/center/applications/components/PostAdoptionPanel.tsx
import * as React from "react";
import { useCenterPostAdoption } from "@/features/center/applications/hooks/useCenterPostAdoption";

type Props = {
  adoptionId: number | null;
};

function formatDateTime(iso?: string) {
  if (!iso) return "-";
  // 서버가 ISO를 주므로 간단 표시(로컬)
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs text-[#374151]">
      {label}
    </span>
  );
}

function StatusBadge({
  submittedAt,
  completedAt,
  rejectionReason,
}: {
  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
}) {
  // 기준은 너희 정책에 따라 바꿔도 됨
  if (rejectionReason) {
    return <span className="rounded-full bg-[#FEF2F2] px-2.5 py-1 text-xs font-semibold text-[#991B1B]">반려</span>;
  }
  if (completedAt) {
    return <span className="rounded-full bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#065F46]">완료</span>;
  }
  if (submittedAt) {
    return <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">제출됨</span>;
  }
  return <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs font-semibold text-[#374151]">진행중</span>;
}

export default function PostAdoptionPanel({ adoptionId }: Props) {
  const { process, steps, selectedStepOrder, detail, loading, error, setSelectedStepOrder } =
    useCenterPostAdoption(adoptionId);

  if (!adoptionId) return null;

  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">사후관리 체크</h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            쉘터 계정은 <span className="font-semibold text-[#111]">조회 전용</span>입니다.
          </p>
        </div>

        {process ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Pill label={`postAdoptionId: ${process.id}`} />
            <Pill label={`updatedAt: ${formatDateTime(process.updatedAt)}`} />
          </div>
        ) : null}
      </div>

      {/* 상태 */}
      {loading ? <div className="mt-4 text-sm text-[#6B7280]">불러오는 중...</div> : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      {!loading && !error && !process ? (
        <div className="mt-4 text-sm text-[#6B7280]">사후관리 프로세스가 없습니다.</div>
      ) : null}

      {/* 스텝 탭 */}
      {process ? (
        <>
          <div className="mt-5 rounded-2xl border border-[#E5E7EB] p-3">
            <div className="flex flex-wrap gap-2">
              {steps.map((s) => {
                const active = selectedStepOrder === s.stepOrder;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStepOrder(s.stepOrder)}
                    className={[
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                      active ? "border-[#111] bg-[#111] text-white" : "border-[#E5E7EB] bg-white text-[#111]",
                    ].join(" ")}
                  >
                    <span className="font-semibold">{s.stepName}</span>
                    <span className={active ? "text-white/80" : "text-[#6B7280]"}>Step {s.stepOrder}</span>
                    <StatusBadge submittedAt={s.submittedAt} completedAt={s.completedAt} rejectionReason={s.rejectionReason} />
                  </button>
                );
              })}
            </div>

            {/* step 요약 메타 */}
            {selectedStepOrder != null ? (
              <div className="mt-3 text-xs text-[#6B7280]">
                선택 단계: Step {selectedStepOrder}
              </div>
            ) : null}
          </div>

          {/* 상세 */}
          <div className="mt-5 rounded-2xl border border-[#E5E7EB] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{detail?.stepName ?? "단계 상세"}</div>
                {detail?.description ? <div className="mt-1 text-sm text-[#6B7280]">{detail.description}</div> : null}
              </div>

              {detail ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {detail.dueDate ? <Pill label={`due: ${detail.dueDate}`} /> : null}
                  {detail.timeStatus ? <Pill label={`status: ${detail.timeStatus}`} /> : null}
                </div>
              ) : null}
            </div>

            {/* 2열 레이아웃 */}
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {/* 체크리스트 */}
              <div className="rounded-2xl border border-[#E5E7EB] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">체크리스트</div>
                  <div className="text-xs text-[#6B7280]">
                    {(detail?.checklistItems ?? []).filter((x) => x.checked).length}/
                    {(detail?.checklistItems ?? []).length}
                  </div>
                </div>

                <ul className="space-y-2">
                  {(detail?.checklistItems ?? []).length === 0 ? (
                    <li className="text-sm text-[#6B7280]">항목 없음</li>
                  ) : (
                    (detail?.checklistItems ?? []).map((it) => (
                      <li
                        key={it.id}
                        className="flex items-start gap-3 rounded-xl border border-[#F3F4F6] bg-white px-3 py-2"
                      >
                        <div
                          className={[
                            "mt-1 h-4 w-4 rounded border",
                            it.checked ? "border-[#111] bg-[#111]" : "border-[#D1D5DB] bg-white",
                          ].join(" ")}
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <div className="text-sm break-words">
                            {it.itemText}
                            {it.required ? <span className="ml-1 text-xs text-[#EF4444]">*</span> : null}
                          </div>
                          <div className="mt-0.5 text-xs text-[#6B7280]">
                            {it.category} · {it.checked ? "체크됨" : "미체크"}
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* 제출파일 */}
              <div className="rounded-2xl border border-[#E5E7EB] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">제출 파일</div>
                  <div className="text-xs text-[#6B7280]">
                    {(detail?.submissionItems ?? []).filter((x) => x.submitted).length}/
                    {(detail?.submissionItems ?? []).length}
                  </div>
                </div>

                <ul className="space-y-2">
                  {(detail?.submissionItems ?? []).length === 0 ? (
                    <li className="text-sm text-[#6B7280]">항목 없음</li>
                  ) : (
                    (detail?.submissionItems ?? []).map((it) => (
                      <li
                        key={it.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[#F3F4F6] bg-white px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {it.submissionName}
                            {it.required ? <span className="ml-1 text-xs text-[#EF4444]">*</span> : null}
                          </div>
                          <div className="mt-0.5 text-xs text-[#6B7280]">
                            {it.type} · {it.submitted ? "제출됨" : "미제출"}
                            {it.originalFileName ? ` · ${it.originalFileName}` : ""}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (it.fileUrl) window.open(it.fileUrl, "_blank", "noopener,noreferrer");
                          }}
                          disabled={!it.fileUrl}
                          className="h-9 shrink-0 rounded-xl bg-[#111] px-3 text-xs font-semibold text-white disabled:opacity-40"
                        >
                          보기
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            {/* footer 메타 */}
            {detail ? (
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#6B7280]">
                <span>submittedAt: {formatDateTime(detail.submittedAt)}</span>
                <span>completedAt: {formatDateTime(detail.completedAt)}</span>
                {detail.rejectionReason ? <span className="text-[#991B1B]">rejection: {detail.rejectionReason}</span> : null}
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
