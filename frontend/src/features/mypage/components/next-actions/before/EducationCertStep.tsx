import { useMemo, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { uploadEducationCert } from "@/features/postAdoption/api/postAdoptionApi";

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId?: number;
};

export function EducationCertStep({ isEditable, onSubmitSuccess, adoptionId }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [educationInstitution, setEducationInstitution] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload certificate.";
      setSubmitError(message);
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
            <label className="text-xs font-semibold text-gray-700">Institution</label>
            <input
              className="h-10 w-full rounded-[12px] border border-[#E5E7EB] px-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
              placeholder="?? ??"
              value={educationInstitution}
              onChange={(event) => setEducationInstitution(event.target.value)}
              disabled={fieldsDisabled}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">Certificate No.</label>
            <input
              className="h-10 w-full rounded-[12px] border border-[#E5E7EB] px-3 text-sm text-[#1F2937] placeholder:text-[#6B7280] focus:border-transparent focus:ring-2 focus:ring-[#5B7CFA]"
              placeholder="??? ??"
              value={certificateNumber}
              onChange={(event) => setCertificateNumber(event.target.value)}
              disabled={fieldsDisabled}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-semibold text-gray-700">Completion Date</label>
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
