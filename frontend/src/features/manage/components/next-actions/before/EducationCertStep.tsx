import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import {
  deleteEducationCert,
  fetchEducationCert,
  uploadEducationCert,
} from "@/features/postAdoption/api/postAdoptionApi";
import type { EducationCertResponse } from "@/features/manage/types";

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId?: number;
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeDateTimeInput(value?: string | null) {
  if (!value) return "";
  if (value.length >= 16) return value.slice(0, 16);
  return value;
}

function resolveApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Login required.";
    if (error.status === 403) return "You do not have permission.";
    if (error.status === 400) return "교육 수료증이 존재하지 않습니다.";
    if (error.status === 404) return "교육 수료증이 존재하지 않습니다.";
    if (error.status === 409) return "The certificate status has changed. Please refresh.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function EducationCertStep({ isEditable, onSubmitSuccess, adoptionId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [educationInstitution, setEducationInstitution] = useState("동물사랑배움터");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [certificate, setCertificate] = useState<EducationCertResponse | null>(null);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canAttach = isEditable && !submitting && !submitted;
  const canSubmit = isEditable && !submitting && !submitted;
  const fieldsDisabled = !isEditable || submitting || submitted;

  const meta = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      sizeKB: Math.round(file.size / 1024),
      type: file.type || "unknown",
    };
  }, [file]);

  const tempMeta = useMemo(() => {
    if (!tempFile) return null;
    return {
      name: tempFile.name,
      sizeKB: Math.round(tempFile.size / 1024),
      type: tempFile.type || "unknown",
    };
  }, [tempFile]);

  const loadCertificate = useCallback(
    async (targetId: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setCertLoading(true);
      }
      setCertError(null);

      try {
        const data = await fetchEducationCert(targetId);
        setCertificate(data);
        setSubmitted(true);
        setFile(null);
        setTempFile(null);
        setEducationInstitution(data.educationInstitution ?? "동물사랑배움터");
        setCertificateNumber(data.certificateNumber ?? "");
        setCompletionDate(normalizeDateTimeInput(data.completionDate ?? ""));
        if (import.meta.env.DEV) {
          console.debug("[education-cert] fetched", data);
        }
      } catch (err) {
        if (err instanceof ApiError && (err.status === 400 || err.status === 404)) {
          setCertificate(null);
          setSubmitted(false);
          setCertError(null);
        } else {
          setCertificate(null);
          setSubmitted(false);
          setCertError(resolveApiErrorMessage(err, "Failed to load certificate."));
        }
      } finally {
        if (!silent) {
          setCertLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!adoptionId) {
      setCertificate(null);
      setSubmitted(false);
      setCertError("Missing adoptionId.");
      return;
    }

    loadCertificate(adoptionId).catch(() => {
      // loadCertificate handles its own errors
    });
  }, [adoptionId, loadCertificate]);

  const openModal = () => {
    if (!canAttach) return;
    setTempFile(file);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const onPickFile = (f: File | null) => setTempFile(f);

  const onConfirm = () => {
    setFile(tempFile ?? null);
    setSubmitted(false);
    setSubmitError(null);
    closeModal();
  };

  const onCancel = () => {
    setTempFile(null);
    closeModal();
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAttach) return;
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) onPickFile(dropped);
  };

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDelete = async () => {
    if (!adoptionId || deleting) return;
    if (!certificate) return;

    const confirmed = window.confirm("Delete the uploaded certificate?");
    if (!confirmed) return;

    setDeleting(true);
    setCertError(null);
    try {
      await deleteEducationCert(adoptionId);
      setCertificate(null);
      setSubmitted(false);
      setFile(null);
      setTempFile(null);
      setEducationInstitution("동물사랑배움터");
      setCertificateNumber("");
      setCompletionDate("");
      await loadCertificate(adoptionId, { silent: true });
    } catch (err) {
      setCertError(resolveApiErrorMessage(err, "Failed to delete certificate."));
      if (err instanceof ApiError && (err.status === 404 || err.status === 409)) {
        await loadCertificate(adoptionId, { silent: true });
      }
    } finally {
      setDeleting(false);
    }
  };

  const normalizeCompletionDate = (value: string) => {
    if (!value) return "";
    if (value.length === 16) return `${value}:00`;
    return value;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (!adoptionId) {
      setSubmitError("Missing adoptionId.");
      return;
    }
    if (!file) {
      setSubmitError("Please attach a certificate file.");
      return;
    }
    if (!educationInstitution.trim() || !certificateNumber.trim() || !completionDate.trim()) {
      setSubmitError("Please fill out required fields.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await uploadEducationCert(adoptionId, {
        educationInstitution: educationInstitution.trim(),
        certificateNumber: certificateNumber.trim(),
        completionDate: normalizeCompletionDate(completionDate.trim()),
        certificateFile: file,
      });
      setSubmitted(true);
      onSubmitSuccess();
      await loadCertificate(adoptionId, { silent: true });
    } catch (err) {
      setSubmitError(resolveApiErrorMessage(err, "Failed to upload certificate."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== 교육 링크 카드 ===== */}
      <div className="rounded-2xl border border-gray-200 p-6">
        <p className="text-sm font-semibold text-gray-900">입양 전 교육</p>
        <p className="mt-1 text-sm text-gray-500">
          교육을 이수한 뒤 수료증 파일을 업로드하세요. (현재는 UI만 구현)
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="https://apms.epis.or.kr/home/kor/learn/online/view.do?menuPos=5&idx=304&act=&searchValue1=&searchValue2=&searchValue3=&searchValue3=&searchKeyword=%EC%9E%85%EC%96%91&pageIndex=1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="rounded-lg">교육 링크로 이동</Button>
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Education certificate</p>
            <p className="mt-1 text-sm text-gray-500">
              Review the uploaded certificate or delete it before re-uploading.
            </p>
          </div>
          {certLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
        </div>

        {certError ? <p className="mt-2 text-xs text-red-600">{certError}</p> : null}

        {!adoptionId ? (
          <p className="mt-4 text-xs text-gray-500">
            Adoption ID is missing. Please reopen this step from the adoption flow.
          </p>
        ) : certificate ? (
          <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="text-xs font-semibold text-gray-500">기관명</p>
              <p className="text-sm text-gray-900">{certificate.educationInstitution}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">자격 번호</p>
              <p className="text-sm text-gray-900">{certificate.certificateNumber}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">수료일자</p>
              <p className="text-sm text-gray-900">
                {formatDateTime(certificate.completionDate)}
              </p>
            </div>
            {certificate.certificateFileUrl ? (
              <a
                className="inline-flex text-xs font-semibold text-blue-600 hover:underline"
                href={certificate.certificateFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open certificate file
              </a>
            ) : null}

            <div className="pt-2">
              <Button
                variant="outline"
                className="rounded-lg"
                disabled={!isEditable || deleting}
                onClick={handleDelete}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            No certificate uploaded yet.
          </div>
        )}

        {certError && adoptionId ? (
          <div className="mt-4">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => loadCertificate(adoptionId)}
              disabled={certLoading}
            >
              Retry
            </Button>
          </div>
        ) : null}
      </div>

      {/* ===== 업로드 카드 ===== */}
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">교육 수료증 업로드</p>
            <p className="mt-1 text-sm text-gray-500">
              파일을 첨부하면 아래에 표시됩니다.
            </p>
          </div>
          {submitError ? (
            <p className="text-xs text-red-600">{submitError}</p>
          ) : null}

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
              canSubmit
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {canSubmit ? "제출 가능" : "제출 불가"}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* ✅ 첨부는 항상 가능 */}
          <Button className="rounded-lg" disabled={!canAttach} onClick={openModal}>
            파일 첨부
          </Button>

          {file && (
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={!canAttach}
              onClick={() => {
                setFile(null);
                setSubmitted(false);
              }}
            >
              첨부 제거
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
          {!meta ? (
            <p className="text-gray-500">첨부된 파일이 없습니다.</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{meta.name}</p>
              <p className="text-gray-500">
                {meta.sizeKB} KB · {meta.type}
              </p>
            </div>
          )}
        </div>

        {/* ✅ 제출 버튼은 항상 보이되, canSubmit일 때만 활성 */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">기관명</label>
            <input
              className="h-10 w-full rounded-[12px] border border-[#E5E7EB] px-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
              placeholder="동물사랑배움터"
              value={educationInstitution}
              onChange={(event) => setEducationInstitution(event.target.value)}
              disabled={fieldsDisabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">자격 번호</label>
            <input
              className="h-10 w-full rounded-[12px] border border-[#E5E7EB] px-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
              placeholder="제 2026-xxxx-xxxxx"
              value={certificateNumber}
              onChange={(event) => setCertificateNumber(event.target.value)}
              disabled={fieldsDisabled}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">수료일자</label>
            <input
              type="datetime-local"
              className="h-10 w-full rounded-[12px] border border-[#E5E7EB] px-3 text-sm text-[#1F2937] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
              value={completionDate}
              onChange={(event) => setCompletionDate(event.target.value)}
              disabled={fieldsDisabled}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {!canSubmit && (
            <p className="text-xs text-gray-500">
              현재 단계에서는 제출할 수 없습니다. (파일 첨부는 가능)
            </p>
          )}

          <div className="flex gap-3">
            <Button
              className="rounded-lg"
              disabled={!canSubmit || !file}
              onClick={handleSubmit}   // ✅ 이거 필수
            >
              {submitting ? "Submitting..." : "Upload"}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== 모달 ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onCancel}
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
                    이 프로젝트에 파일을 업로드하여 첨부하세요
                  </p>
                </div>

                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-gray-100"
                  onClick={onCancel}
                  aria-label="닫기"
                >
                  <span className="text-xl leading-none text-gray-500">×</span>
                </button>
              </div>

              {/* body */}
              <div className="px-6 pb-6">
                {/* drop zone */}
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
                    {/* 업로드 아이콘(간단) */}
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-gray-600"
                    >
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
                  <p className="mt-1 text-xs text-gray-400">
                    SVG, PNG, JPG or GIF (max. 800×400px)
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    disabled={!canAttach}
                  />
                </div>

                {/* selected file row */}
                {tempMeta && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/40 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
                        {/* 파일 아이콘 */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 2v5h5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {tempMeta.name}
                        </p>
                        <p className="text-xs text-gray-500">{tempMeta.sizeKB} KB</p>

                        {/* progress bar (UI용: 100%) */}
                        <div className="mt-2 h-2 w-full rounded-full bg-blue-100">
                          <div className="h-2 w-full rounded-full bg-blue-500" />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">100%</p>
                        {/* 체크 아이콘 */}
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-blue-600 text-white">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                              d="m20 6-11 11-5-5"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* footer buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" className="rounded-lg" onClick={onCancel}>
                    취소
                  </Button>
                  <Button
                    className="rounded-lg"
                    onClick={onConfirm}
                    disabled={!tempFile}
                  >
                    확인
                  </Button>
                </div>

                {/* ✅ 제출 불가 상태 안내(원하면 모달에도 표기) */}
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





