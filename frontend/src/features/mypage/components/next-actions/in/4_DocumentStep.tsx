import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import {
  deleteAdoptionDocument,
  fetchAdoptionDocuments,
  uploadAdoptionDocument,
} from "@/features/postAdoption/api/postAdoptionApi";
import type { DocumentType } from "@/features/adoptionApplication/types";
import type { AdoptionDocumentResponse } from "@/features/mypage/types";

type Props = {
  isEditable: boolean; // 제출 가능 여부(단계에 따른)
  onSubmitSuccess: () => void;
  adoptionId: number; // 부모 컴포넌트에서 유효한 ID를 보장해야 함
};

type DocKey = "idCard" | "familyCert" | "lease";

type DocFile = File | null;

type DocsState = Record<DocKey, DocFile>;

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadState = Record<DocKey, { status: UploadStatus; error?: string }>;

const DOCS: Array<{ key: DocKey; label: string; hint: string; type: DocumentType }> = [
  { key: "idCard", label: "신분증 사본", hint: "주민등록증 또는 운전면허증 사본", type: "ID_CARD" },
  { key: "familyCert", label: "가족관계증명서", hint: "최근 발급본 권장", type: "FAMILY_CERT" },
  { key: "lease", label: "임대차계약서", hint: "전/월세 계약서 사본(해당 시)", type: "LEASE_CONTRACT" },
];

function fileMeta(file: File | null) {
  if (!file) return null;
  return {
    name: file.name,
    sizeKB: Math.round(file.size / 1024),
    type: file.type || "unknown",
  };
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Login required.";
    if (error.status === 403) return "You do not have permission.";
    if (error.status === 404) return "Not found.";
    if (error.status === 409) return "The document status has changed. Please refresh.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function DocumentStep({ isEditable, onSubmitSuccess, adoptionId }: Props) {
  // 실제 첨부 파일(항목별)
  const [docs, setDocs] = useState<DocsState>({
    idCard: null,
    familyCert: null,
    lease: null,
  });

  // "제출 완료" 스냅샷
  const [submittedDocs, setSubmittedDocs] = useState<DocsState | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    idCard: { status: "idle" },
    familyCert: { status: "idle" },
    lease: { status: "idle" },
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [documentList, setDocumentList] = useState<AdoptionDocumentResponse[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // 모달
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<DocKey | null>(null);

  // 모달에서 임시 선택(확인 눌러야 반영)
  const [tempFile, setTempFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canAttach = isEditable;
  const canSubmit = isEditable;

  const isSubmitted = submittedDocs !== null;

  const allAttached = useMemo(() => {
    return DOCS.every(({ key }) => !!docs[key]);
  }, [docs]);

  const canSubmitNow = canSubmit && allAttached && !submitting && !isSubmitted;

  const documentLabel = (type: string) =>
    DOCS.find((doc) => doc.type === type)?.label ?? type;

  const loadDocuments = useCallback(
    async (targetId: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setDocsLoading(true);
      }
      setDocsError(null);

      try {
        const data = await fetchAdoptionDocuments(targetId);
        setDocumentList(data);
        if (import.meta.env.DEV) {
          console.debug("[documents] fetched", data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setDocumentList([]);
          setDocsError(null);
        } else {
          setDocumentList([]);
          setDocsError(resolveApiErrorMessage(err, "Failed to load documents."));
        }
      } finally {
        if (!silent) {
          setDocsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!adoptionId) {
      setDocsError("Adoption ID가 유효하지 않습니다. 페이지를 새로고침 해주세요.");
      setDocumentList([]);
      return;
    }

    loadDocuments(adoptionId).catch(() => {
      // loadDocuments handles its own errors
    });
  }, [adoptionId, loadDocuments]);

  const openModal = (key: DocKey) => {
    if (!canAttach) return;
    setActiveKey(key);
    setTempFile(docs[key]); // 기존 파일 있으면 미리 채움
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveKey(null);
  };

  const onCancelModal = () => {
    setTempFile(null);
    closeModal();
  };

  const onConfirmModal = () => {
    if (!activeKey) return;
    setDocs((prev) => ({ ...prev, [activeKey]: tempFile ?? null }));
    setSubmittedDocs(null);
    setUploadState((prev) => ({
      ...prev,
      [activeKey]: { status: "idle" },
    }));
    closeModal();
  };

  const removeFile = (key: DocKey) => {
    setDocs((prev) => ({ ...prev, [key]: null }));
    setSubmittedDocs(null);
    setUploadState((prev) => ({
      ...prev,
      [key]: { status: "idle" },
    }));
  };

  const handleDeleteDocument = async (doc: AdoptionDocumentResponse) => {
    if (!isEditable || deletingId) return;
    if (!adoptionId) {
      setDocsError("Adoption ID가 유효하지 않습니다.");
      return;
    }

    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    setDeletingId(doc.id);
    setDocsError(null);

    try {
      await deleteAdoptionDocument(adoptionId, doc.id);
      setDocumentList((prev) => prev.filter((item) => item.id !== doc.id));
      setSubmittedDocs(null);
      await loadDocuments(adoptionId, { silent: true });
    } catch (err) {
      setDocsError(resolveApiErrorMessage(err, "Failed to delete document."));
      if (err instanceof ApiError && (err.status === 404 || err.status === 409)) {
        await loadDocuments(adoptionId, { silent: true });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async () => {
    if (!canSubmitNow) return;

    if (!adoptionId) {
      setSubmitError("Adoption ID가 유효하지 않습니다.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    setUploadState((prev) => {
      const next = { ...prev };
      DOCS.forEach(({ key }) => {
        next[key] = { status: "uploading" };
      });
      return next;
    });

    const results = await Promise.allSettled(
      DOCS.map(async (doc) => {
        const file = docs[doc.key];
        if (!file) {
          setUploadState((prev) => ({
            ...prev,
            [doc.key]: { status: "error", error: "파일이 없습니다." },
          }));
          throw new Error("Missing file");
        }

        try {
          await uploadAdoptionDocument(adoptionId, doc.type, file);
          setUploadState((prev) => ({
            ...prev,
            [doc.key]: { status: "success" },
          }));
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "업로드 실패";
          setUploadState((prev) => ({
            ...prev,
            [doc.key]: { status: "error", error: message },
          }));
          throw err;
        }
      })
    );

    const hasFailure = results.some((r) => r.status === "rejected");
    if (hasFailure) {
      setSubmitError("일부 문서 업로드에 실패했습니다. 상태를 확인해주세요.");
    } else {
      setSubmittedDocs(docs);
      onSubmitSuccess();
      await loadDocuments(adoptionId, { silent: true });
    }

    setSubmitting(false);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAttach) return;

    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) setTempFile(dropped);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Uploaded documents</p>
            <p className="mt-1 text-sm text-gray-500">
              Review or delete uploaded documents.
            </p>
          </div>
          {docsLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
        </div>

        {docsError ? <p className="mt-2 text-xs text-red-600">{docsError}</p> : null}

        {!docsLoading && !docsError && adoptionId && documentList.length === 0 ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            No uploaded documents yet.
          </div>
        ) : null}

        {documentList.length > 0 && (
          <div className="mt-4 space-y-3">
            {documentList.map((doc) => (
              <div key={doc.id} className="rounded-2xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {documentLabel(doc.documentType)}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {doc.originalFileName}
                    </p>
                    {doc.filePath ? (
                      <a
                        className="mt-2 inline-flex text-xs font-medium text-blue-600 hover:underline"
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open file
                      </a>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <Button
                      variant="outline"
                      className="rounded-lg"
                      disabled={!isEditable || deletingId === doc.id}
                      onClick={() => handleDeleteDocument(doc)}
                    >
                      {deletingId === doc.id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {docsError && adoptionId ? (
          <div className="mt-4">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => loadDocuments(adoptionId)}
              disabled={docsLoading}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {!adoptionId ? (
          <p className="mt-4 text-xs text-gray-500">
            Adoption ID is missing. Please reopen this step from the adoption flow.
          </p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 문서 제출</p>
            <p className="mt-1 text-sm text-gray-500">
              아래 3가지 서류를 각각 첨부한 뒤 제출하세요.
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
              isSubmitted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : canSubmit
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {isSubmitted ? "제출 완료" : canSubmit ? "제출 가능" : "제출 불가"}
          </span>
        </div>

        {/* 항목 3개 */}
        <div className="mt-6 space-y-4">
          {DOCS.map((d) => {
            const m = fileMeta(docs[d.key]);
            const state = uploadState[d.key];
            return (
              <div
                key={d.key}
                className="rounded-2xl border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{d.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{d.hint}</p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      className="rounded-lg"
                      disabled={!canAttach || isSubmitted}
                      onClick={() => openModal(d.key)}
                    >
                      첨부하기
                    </Button>

                    {docs[d.key] && (
                      <Button
                        variant="outline"
                        className="rounded-lg"
                        disabled={!canAttach || isSubmitted}
                        onClick={() => removeFile(d.key)}
                      >
                        제거
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                  {!m ? (
                    <p className="text-gray-500">첨부된 파일이 없습니다.</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-gray-500">
                        {m.sizeKB} KB · {m.type}
                      </p>
                    </div>
                  )}
                </div>

                {state.status === "uploading" && (
                  <p className="mt-2 text-xs text-blue-600">업로드 중...</p>
                )}
                {state.status === "success" && (
                  <p className="mt-2 text-xs text-emerald-600">업로드 완료</p>
                )}
                {state.status === "error" && (
                  <p className="mt-2 text-xs text-red-600">
                    {state.error ?? "업로드에 실패했습니다."}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 제출 영역 */}
        <div className="mt-6 space-y-2">
          {!canSubmit && !isSubmitted && (
            <p className="text-xs text-gray-500">
              현재 단계에서는 제출할 수 없습니다. (파일 첨부는 가능)
            </p>
          )}

          {canSubmit && !isSubmitted && !allAttached && (
            <p className="text-xs text-gray-500">
              3가지 서류를 모두 첨부해야 제출할 수 있습니다.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              className="rounded-lg"
              disabled={!canSubmitNow}
              onClick={onSubmit}
            >
              {submitting ? "업로드 중..." : isSubmitted ? "제출 완료" : "문서 제출"}
            </Button>
          </div>

          {submitError ? (
            <p className="text-xs text-red-600">{submitError}</p>
          ) : null}
        </div>
      </div>

      {/* 제출 완료 요약 */}
      {submittedDocs && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6">
          <p className="text-sm font-semibold text-emerald-900">제출된 문서</p>
          <p className="mt-1 text-sm text-emerald-800/70">
            아래 파일이 제출된 상태로 저장되었습니다.
          </p>

          <div className="mt-4 space-y-3">
            {DOCS.map((d) => {
              const m = fileMeta(submittedDocs[d.key]);
              return (
                <div key={`submitted-${d.key}`} className="rounded-xl bg-white p-4 text-sm">
                  <p className="text-sm font-semibold text-gray-900">{d.label}</p>
                  {!m ? (
                    <p className="mt-1 text-gray-500">—</p>
                  ) : (
                    <>
                      <p className="mt-1 font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-gray-500">
                        {m.sizeKB} KB · {m.type}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== 모달 ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCancelModal}
            aria-hidden="true"
          />

          {/* dialog */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-[520px] rounded-2xl bg-white shadow-xl">
              {/* header */}
              <div className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">파일 업로드 및 첨부</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeKey
                      ? DOCS.find((d) => d.key === activeKey)?.label
                      : "문서"}{" "}
                    파일을 업로드하여 첨부하세요
                  </p>
                </div>

                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100"
                  onClick={onCancelModal}
                  aria-label="닫기"
                >
                  <span className="text-xl leading-none text-gray-500">×</span>
                </button>
              </div>

              {/* body */}
              <div className="px-6 pb-6">
                <div
                  className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      fileInputRef.current?.click();
                  }}
                >
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gray-50">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                      <path
                        d="M12 16V4m0 0 4 4M12 4 8 8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">클릭하여 업로드</span>
                    <span className="text-gray-500"> 하거나 드래그 앤 드롭하세요</span>
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setTempFile(e.target.files?.[0] ?? null)}
                    disabled={!canAttach}
                  />
                </div>

                {/* 선택된 파일 */}
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                  {!tempFile ? (
                    <p className="text-gray-500">선택된 파일이 없습니다.</p>
                  ) : (
                    (() => {
                      const m = fileMeta(tempFile);
                      return (
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900 truncate">{m?.name}</p>
                          <p className="text-gray-500">
                            {m?.sizeKB} KB · {m?.type}
                          </p>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" className="rounded-lg" onClick={onCancelModal}>
                    취소
                  </Button>
                  <Button
                    className="rounded-lg"
                    onClick={onConfirmModal}
                    disabled={!tempFile}
                  >
                    확인
                  </Button>
                </div>

                {!canSubmit && (
                  <p className="mt-3 text-xs text-gray-500">
                    현재 단계에서는 제출이 불가합니다. 첨부만 가능합니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
