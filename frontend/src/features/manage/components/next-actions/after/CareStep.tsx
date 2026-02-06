import { useEffect, useMemo, useRef, useState } from "react";
import "@/shared/styles/uiverse/PostAdoptionStepper.css";

import {
  fetchPostAdoptionProcessByAdoptionId,
  fetchPostAdoptionStepDetail,
  updatePostAdoptionChecklistItem,
  uploadPostAdoptionSubmissionFile,
  deletePostAdoptionSubmissionFile,
  type PostAdoptionStepDetailResponse,
  type PostAdoptionChecklistItem,
  type PostAdoptionSubmissionItem,
} from "@/features/postAdoption/api/postAdoptionApi";
import { ApiError } from "@/shared/api/client";

type CareStepItem = { title: string; time?: string };
type CareUiStatus = "completed" | "active" | "pending";

const BASE_STEPS: CareStepItem[] = [
  { title: "입양 당일 체크", time: "Day 0" },
  { title: "3일차 체크", time: "Day 3" },
  { title: "1주 적응", time: "Day 7" },
  { title: "2주 점검", time: "Day 14" },
  { title: "1개월 건강 체크", time: "Day 30" },
  { title: "2개월 체크", time: "Day 60" },
  { title: "3개월 마무리", time: "Day 90" },
];

function statusLabel(status: CareUiStatus) {
  if (status === "completed") return "Completed";
  if (status === "active") return "In Progress";
  return "Pending";
}

const DEFAULT_ACCEPT_BY_TYPE = (type: string) => {
  const t = (type ?? "").toUpperCase();
  if (t === "IMAGE") return ".jpg,.jpeg,.png";
  if (t === "PDF") return ".pdf";
  // fallback
  return "";
};

const MAX_MB = 10;
function validateFile(file: File, accept: string): string | null {
  const maxBytes = MAX_MB * 1024 * 1024;
  if (file.size > maxBytes) return `파일 용량은 ${MAX_MB}MB 이하여야 합니다.`;

  if (!accept) return null;
  const exts = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (exts.length === 0) return null;

  const lower = file.name.toLowerCase();
  const ok = exts.some((ext) => lower.endsWith(ext));
  if (!ok) return `${exts.join("/").replaceAll(".", "").toUpperCase()} 파일만 업로드 가능합니다.`;

  return null;
}

type Props = {
  adoptionId?: number;
};

type UploadUi = {
  file: File | null;
  error?: string;
  previewUrl?: string;
};

export function CareStep({ adoptionId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  // “완료 step”은 지금 서버 스펙에 명확한 completed 기준이 없어서
  // UI stepper는 현재 선택/진행만 보여주고, 완료 체크는 서버 필드가 있으면 그걸로 바꾸면 됨.
  const [completedSet] = useState<Set<number>>(() => new Set());

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [postAdoptionId, setPostAdoptionId] = useState<number | null>(null);
  const [stepDetail, setStepDetail] = useState<PostAdoptionStepDetailResponse | null>(null);

  const [uploads, setUploads] = useState<Record<number, UploadUi>>({}); // key: submissionId

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // preview revoke
      Object.values(uploads).forEach((u) => {
        if (u.previewUrl) URL.revokeObjectURL(u.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stepOrder = activeIndex + 1; // Swagger stepOrder가 1..N이라 가정

  const activeStepIndex = useMemo(() => {
    for (let i = 0; i < BASE_STEPS.length; i++) {
      if (!completedSet.has(i)) return i;
    }
    return BASE_STEPS.length - 1;
  }, [completedSet]);

  const stepStates = useMemo(() => {
    return BASE_STEPS.map((s, idx) => {
      const status: CareUiStatus = completedSet.has(idx)
        ? "completed"
        : idx === activeStepIndex
          ? "active"
          : "pending";
      return { ...s, status };
    });
  }, [completedSet, activeStepIndex]);

  const isActiveStep = activeIndex === activeStepIndex;
  const isCompleted = completedSet.has(activeIndex);

  const loadStep = async (pid: number, order: number) => {
    const detail = await fetchPostAdoptionStepDetail(pid, order);
    setStepDetail(detail);

    // submissionId별 upload UI 상태가 없으면 초기화
    const nextUploads: Record<number, UploadUi> = {};
    for (const s of detail.submissionItems ?? []) {
      const prev = uploads[s.id];
      nextUploads[s.id] = prev ?? { file: null };
    }
    setUploads(nextUploads);
  };

  useEffect(() => {
    if (!adoptionId) return;

    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        // ✅ “생성/시작” 같은 추측 API 절대 금지: 오직 GET으로만 조회
        const process = await fetchPostAdoptionProcessByAdoptionId(adoptionId);
        if (!process?.id) throw new Error("postAdoptionId missing");

        if (!mountedRef.current) return;
        setPostAdoptionId(process.id);

        await loadStep(process.id, stepOrder);
      } catch (e) {
        if (!mountedRef.current) return;

        // 401이면 토큰/권한 문제 (Swagger Try it out에서 401 나온 것과 동일)
        if (e instanceof ApiError && e.status === 401) {
          setLoadError("401 Unauthorized: 로그인 토큰(Authorization)이 필요합니다. 프론트에서 토큰이 붙는지 확인하세요.");
        } else if (e instanceof ApiError) {
          setLoadError(e.message);
        } else if (e instanceof Error) {
          setLoadError(e.message);
        } else {
          setLoadError("서버 오류");
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adoptionId, stepOrder]);

  const onPrev = () => setActiveIndex((v) => Math.max(0, v - 1));
  const onNext = () => setActiveIndex((v) => Math.min(stepStates.length - 1, v + 1));

  const toggleChecklist = async (item: PostAdoptionChecklistItem) => {
    if (!postAdoptionId) return;
    if (!isActiveStep || isCompleted) return;

    const nextChecked = !item.checked;

    // optimistic update
    setStepDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        checklistItems: prev.checklistItems.map((x) =>
          x.id === item.id ? { ...x, checked: nextChecked } : x
        ),
      };
    });

    try {
      await updatePostAdoptionChecklistItem(postAdoptionId, stepOrder, item.id, nextChecked);
      await loadStep(postAdoptionId, stepOrder);
    } catch (e) {
      // rollback (reload로 복구)
      await loadStep(postAdoptionId, stepOrder);
      const msg = e instanceof ApiError ? e.message : "체크 저장 실패";
      alert(msg);
    }
  };

  const setSubmissionFile = (submission: PostAdoptionSubmissionItem, file: File | null) => {
    setUploads((prev) => {
      const current = prev[submission.id] ?? { file: null };

      if (current.previewUrl) URL.revokeObjectURL(current.previewUrl);

      if (!file) {
        return { ...prev, [submission.id]: { file: null, error: "파일을 선택하세요." } };
      }

      const accept = DEFAULT_ACCEPT_BY_TYPE(submission.type);
      const err = validateFile(file, accept);
      if (err) {
        return { ...prev, [submission.id]: { file: null, error: err } };
      }

      const previewUrl =
        file.type === "application/pdf" ? undefined : URL.createObjectURL(file);

      return { ...prev, [submission.id]: { file, error: undefined, previewUrl } };
    });
  };

  const submitSubmission = async (submission: PostAdoptionSubmissionItem) => {
    if (!postAdoptionId) return;
    if (!isActiveStep || isCompleted) return;

    const ui = uploads[submission.id];
    if (!ui?.file) {
      setUploads((prev) => ({
        ...prev,
        [submission.id]: { ...(prev[submission.id] ?? { file: null }), error: "파일을 첨부한 뒤 제출해 주세요." },
      }));
      return;
    }

    try {
      await uploadPostAdoptionSubmissionFile(postAdoptionId, stepOrder, submission.id, ui.file);
      await loadStep(postAdoptionId, stepOrder);
      // 업로드 성공 시 로컬 선택 파일 초기화
      setUploads((prev) => {
        const cur = prev[submission.id];
        if (cur?.previewUrl) URL.revokeObjectURL(cur.previewUrl);
        return { ...prev, [submission.id]: { file: null } };
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "제출 실패";
      alert(msg);
    }
  };

  const deleteSubmission = async (submission: PostAdoptionSubmissionItem) => {
    if (!postAdoptionId) return;
    if (!isActiveStep || isCompleted) return;

    try {
      await deletePostAdoptionSubmissionFile(postAdoptionId, stepOrder, submission.id);
      await loadStep(postAdoptionId, stepOrder);
      // 로컬 선택 파일도 초기화
      setUploads((prev) => {
        const cur = prev[submission.id];
        if (cur?.previewUrl) URL.revokeObjectURL(cur.previewUrl);
        return { ...prev, [submission.id]: { file: null } };
      });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "삭제 실패";
      alert(msg);
    }
  };

  const checklist = stepDetail?.checklistItems ?? [];
  const submissions = stepDetail?.submissionItems ?? [];

  if (!adoptionId) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        adoptionId가 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[520px_1fr]">
      {/* Left stepper */}
      <div className="stepper-box">
        {stepStates.map((s, idx) => {
          const stepClass =
            s.status === "completed"
              ? "stepper-step stepper-completed"
              : s.status === "active"
                ? "stepper-step stepper-active"
                : "stepper-step stepper-pending";

          const isSelected = activeIndex === idx;

          return (
            <button
              key={`${s.title}-${idx}`}
              type="button"
              className={`${stepClass} ${isSelected ? "stepper-selected" : ""}`}
              onClick={() => setActiveIndex(idx)}
              style={{ textAlign: "left", width: "100%" }}
            >
              <div className="stepper-circle">
                {s.status === "completed" ? (
                  <svg
                    viewBox="0 0 16 16"
                    className="bi bi-check-lg"
                    fill="currentColor"
                    height="16"
                    width="16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              <div className="stepper-line" />

              <div className="stepper-content">
                <div className="stepper-title">{s.title}</div>
                <div className="stepper-status">{statusLabel(s.status)}</div>
                {s.time ? <div className="stepper-time">{s.time}</div> : null}
              </div>
            </button>
          );
        })}

        <div className="stepper-controls">
          <button
            type="button"
            className="stepper-button"
            onClick={onPrev}
            disabled={activeIndex === 0}
          >
            이전
          </button>
          <button
            type="button"
            className="stepper-button stepper-button-primary"
            onClick={onNext}
            disabled={activeIndex === stepStates.length - 1}
          >
            다음
          </button>
        </div>
      </div>

      {/* Right detail */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">선택한 단계</p>
            <h3 className="mt-1 text-lg font-semibold text-gray-900">
              {BASE_STEPS[activeIndex]?.title}
            </h3>
            {loading ? <p className="mt-2 text-sm text-gray-500">불러오는 중…</p> : null}
            {loadError ? <p className="mt-2 text-sm text-red-600">{loadError}</p> : null}
            {postAdoptionId ? (
              <p className="mt-1 text-xs text-gray-400">
                postAdoptionId: {postAdoptionId} / stepOrder: {stepOrder}
              </p>
            ) : null}
            {stepDetail?.stepName ? (
              <p className="mt-1 text-xs text-gray-500">서버 stepName: {stepDetail.stepName}</p>
            ) : null}
          </div>

          <div className="text-xs text-gray-400">
            {isActiveStep ? "진행중인 단계" : "진행중 단계만 수정 가능"}
          </div>
        </div>

        {/* Checklist */}
        <section className="rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900">체크리스트</h4>

          {checklist.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">체크리스트 항목이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {checklist.map((it) => {
                const disabled = !isActiveStep || isCompleted;
                return (
                  <label
                    key={it.id}
                    className={`flex items-start gap-2 text-sm ${
                      disabled ? "cursor-default text-gray-500" : "cursor-pointer text-gray-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={Boolean(it.checked)}
                      disabled={disabled}
                      onChange={() => void toggleChecklist(it)}
                    />
                    <span className={it.checked ? "line-through text-gray-400" : ""}>
                      {it.itemText}
                      {it.required ? <span className="ml-2 text-xs text-red-500">*</span> : null}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">* 진행중인 단계에서만 체크 변경이 가능합니다.</p>
        </section>

        {/* Submissions */}
        <section className="mt-4 rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-900">첨부파일 제출</h4>

          {submissions.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">제출 항목이 없습니다.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {submissions.map((s) => {
                const ui = uploads[s.id] ?? { file: null };
                const disabled = !isActiveStep || isCompleted;
                const accept = DEFAULT_ACCEPT_BY_TYPE(s.type);

                return (
                  <div key={s.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{s.submissionName}</p>
                        {s.description ? (
                          <p className="mt-1 text-xs text-gray-500">{s.description}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-gray-400">
                          type: {s.type} / required: {String(s.required)}
                        </p>
                      </div>

                      <div className="text-xs font-semibold">
                        {s.submitted ? (
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 whitespace-nowrap">
                            제출됨
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600 whitespace-nowrap">
                            미제출
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <input
                        type="file"
                        accept={accept}
                        onChange={(e) => setSubmissionFile(s, e.target.files?.[0] ?? null)}
                        className="block w-full max-w-[420px] text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-100"
                        disabled={disabled}
                      />

                      {ui.file ? (
                        <p className="mt-2 text-xs text-gray-600">선택: {ui.file.name}</p>
                      ) : s.originalFileName ? (
                        <p className="mt-2 text-xs text-gray-600">서버 파일: {s.originalFileName}</p>
                      ) : null}

                      {ui.error ? <p className="mt-2 text-xs text-red-600">{ui.error}</p> : null}

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => void submitSubmission(s)}
                          disabled={disabled || !ui.file}
                          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          업로드
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteSubmission(s)}
                          disabled={disabled}
                          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
                        >
                          삭제
                        </button>
                      </div>

                      {s.fileUrl ? (
                        <p className="mt-2 text-xs text-gray-400 break-all">
                          fileUrl: {s.fileUrl}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-gray-400">
            * 업로드는 “파일 선택 → 업로드” 순서입니다. (Swagger: multipart/form-data key는 file)
          </p>
        </section>
      </div>
    </div>
  );
}
