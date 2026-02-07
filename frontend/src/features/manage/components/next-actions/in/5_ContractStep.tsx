// ContractStep.tsx
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import {
  deleteAdoptionContract,
  getAdoptionContract,
  uploadAdoptionContract,
} from "@/features/postAdoption/api/postAdoptionApi";
import type { AdoptionContractResponse } from "@/features/manage/types";
import { AdoptionPdfOverlay } from "./AdoptionPdfOverlay";
import {
  ContractOverlayValues,
  createDefaultContractOverlayValues,
} from "./contractOverlayValues";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId?: number;
  userId: string;
};

const formatDateTime = (value?: string | null) => {
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
};

const formatFileSize = (size?: number | null) => {
  if (!size || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const resolveApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Login required.";
    if (error.status === 403) return "You do not have permission.";
    if (error.status === 404) return "Application form not found.";
    if (error.status === 409) return "The application form status has changed. Please refresh.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

const sanitizeFileStem = (input: string) =>
  (input ?? "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 40) || "user";

const stripAllStylesheets = (doc: Document) => {
  doc.querySelectorAll("link[rel='stylesheet'], style").forEach((el) => el.remove());
};

export function ContractStep({ isEditable, onSubmitSuccess, adoptionId, userId }: Props) {
  const LgButton = ({
    variant = "mypage",
    className,
    ...props
  }: React.ComponentProps<typeof Button>) => (
    <Button variant={variant} size="default" className={className} {...props} />
  );

  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ContractOverlayValues>(createDefaultContractOverlayValues());

  const [applicationForm, setApplicationForm] =
    useState<AdoptionContractResponse | null>(null);
  const [applicationFormLoading, setApplicationFormLoading] = useState(false);
  const [applicationFormError, setApplicationFormError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);

  const [capturing, setCapturing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ✅ 캡쳐 직전에 overlay를 "capture" 모드로 전환
  const [overlayMode, setOverlayMode] = useState<"edit" | "capture">("edit");

  const overlayCaptureRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  const loadApplicationForm = useCallback(
    async (targetId: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setApplicationFormLoading(true);
      setApplicationFormError(null);

      try {
        const data = await getAdoptionContract(targetId);
        setApplicationForm(data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setApplicationForm(null);
          setApplicationFormError(null);
        } else {
          setApplicationForm(null);
          setApplicationFormError(
            resolveApiErrorMessage(err, "Failed to load application form.")
          );
        }
      } finally {
        if (!silent) setApplicationFormLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!adoptionId) {
      setApplicationForm(null);
      setApplicationFormError("Missing adoptionId.");
      return;
    }
    loadApplicationForm(adoptionId).catch(() => {});
  }, [adoptionId, loadApplicationForm]);

  const handleDeleteUploaded = async () => {
    if (!adoptionId || !applicationForm || deleting) return;
    const confirmed = window.confirm("Delete the application form file?");
    if (!confirmed) return;

    setDeleting(true);
    setApplicationFormError(null);

    try {
      await deleteAdoptionContract(adoptionId);
      setApplicationForm(null);
      await loadApplicationForm(adoptionId, { silent: true });
    } catch (err) {
      setApplicationFormError(resolveApiErrorMessage(err, "Failed to delete application form."));
    } finally {
      setDeleting(false);
    }
  };

  const handleClearPending = () => {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    setPendingPreviewUrl(null);
    setPendingFile(null);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pdfUrl = "/docs/adoption-application.pdf";

  const addImageFitA4 = (pdf: jsPDF, imgData: string, canvasW: number, canvasH: number) => {
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const scale = Math.min(pageW / canvasW, pageH / canvasH);
    const imgW = canvasW * scale;
    const imgH = canvasH * scale;
    const x = (pageW - imgW) / 2;
    const y = (pageH - imgH) / 2;
    pdf.addImage(imgData, "PNG", x, y, imgW, imgH);
  };

  const captureToPdfFile = async (filename: string) => {
    const el = overlayCaptureRef.current;
    if (!el) throw new Error("capture target missing");

    // ✅ 캡쳐 레이어로 전환 후 렌더 반영 대기(2프레임)
    setOverlayMode("capture");
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const captureW = Math.ceil(el.scrollWidth || el.getBoundingClientRect().width);
    const captureH = Math.ceil(el.scrollHeight || el.getBoundingClientRect().height);

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
        windowWidth: captureW,
        windowHeight: captureH,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (doc) => {
          // ✅ oklab/oklch 파서 크래시 방지
          stripAllStylesheets(doc);

          const root = doc.querySelector("[data-capture-root]") as HTMLElement | null;
          if (!root) return;

          root.style.width = `${captureW}px`;
          root.style.height = `${captureH}px`;
          root.style.background = "#fff";
          root.style.overflow = "visible";
        },
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      addImageFitA4(pdf, imgData, canvas.width, canvas.height);

      const blob = pdf.output("blob");
      return new File([blob], filename, { type: "application/pdf" });
    } finally {
      // ✅ 원복
      setOverlayMode("edit");
    }
  };

  const handleConfirmCapture = async () => {
    if (!isEditable) return;
    if (!adoptionId) {
      setApplicationFormError("Missing adoptionId.");
      return;
    }
    if (capturing) return;

    setCapturing(true);
    setApplicationFormError(null);
    setModalError(null);

    try {
      const stem = sanitizeFileStem(values.name || userId || "user");
      const filename = `${stem}_입양신청서.pdf`;

      const pdfFile = await captureToPdfFile(filename);

      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
      const previewUrl = URL.createObjectURL(pdfFile);

      setPendingFile(pdfFile);
      setPendingPreviewUrl(previewUrl);

      requestAnimationFrame(() => setOpen(false));
    } catch (err) {
      console.error("[capture error]", err);
      setModalError(resolveApiErrorMessage(err, "Failed to create application form PDF."));
    } finally {
      setCapturing(false);
    }
  };

  const handleSubmitUpload = async () => {
    if (!isEditable) return;
    if (!adoptionId) {
      setApplicationFormError("Missing adoptionId.");
      return;
    }
    if (!pendingFile) {
      setApplicationFormError("첨부된 PDF가 없습니다. 먼저 신청서를 작성/확인해주세요.");
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setApplicationFormError(null);

    try {
      const response = await uploadAdoptionContract(adoptionId, pendingFile);
      setApplicationForm(response);

      handleClearPending();
      onSubmitSuccess();
    } catch (err) {
      setApplicationFormError(resolveApiErrorMessage(err, "Failed to upload application form."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== 조회/삭제 카드 ===== */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 신청서</p>
            <p className="mt-1 text-sm text-gray-500">
              업로드된 입양 신청서를 확인하거나 삭제 후 재업로드하세요.
            </p>
          </div>
          {applicationFormLoading ? <span className="text-xs text-gray-500">로딩 중...</span> : null}
        </div>

        {applicationFormError ? <p className="mt-2 text-xs text-red-600">{applicationFormError}</p> : null}

        {!adoptionId ? (
          <p className="mt-4 text-xs text-gray-500">입양 ID가 없습니다. 입양 과정에서 다시 열어주세요.</p>
        ) : applicationForm ? (
          <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="text-xs font-semibold text-gray-500">파일명</p>
              <p className="text-sm text-gray-900">
                {applicationForm.originalFileName || "입양 신청서 파일"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">업로드 정보</p>
              <p className="text-sm text-gray-900">
                {formatFileSize(applicationForm.fileSize)} · {formatDateTime(applicationForm.uploadedAt)}
              </p>
            </div>

            {applicationForm.contractFileUrl ? (
              <a
                className="inline-flex text-xs font-semibold text-blue-600 hover:underline"
                href={applicationForm.contractFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                입양 신청서 파일 열기
              </a>
            ) : null}

            <div className="pt-2 flex justify-end">
              <LgButton
                variant="outline"
                className="rounded-lg"
                disabled={!isEditable || deleting}
                onClick={handleDeleteUploaded}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </LgButton>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            업로드된 입양 신청서가 없습니다.
          </div>
        )}
      </div>

      {/* ===== 작성/첨부/제출 카드 ===== */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
        <div>
          <p className="text-sm font-semibold text-gray-900">입양 신청서 작성</p>
          <p className="mt-1 text-sm text-gray-500">
            모달에서 작성 후 확인을 누르면 PDF로 생성되어 첨부됩니다. 제출하기를 눌러 업로드하세요.
          </p>
        </div>

        <div className="mt-4">
          {pendingFile ? (
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">첨부됨</p>
                  <p className="text-sm text-gray-900">{pendingFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatFileSize(pendingFile.size)}</p>
                </div>

                <div className="flex gap-2">
                  {pendingPreviewUrl ? (
                    <a
                      href={pendingPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                    >
                      미리보기
                    </a>
                  ) : null}
                  <LgButton
                    variant="outline"
                    className="h-auto px-0 py-0 text-xs font-semibold text-gray-600 hover:bg-transparent hover:underline"
                    onClick={handleClearPending}
                    disabled={submitting}
                  >
                    첨부 제거
                  </LgButton>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <LgButton
                  className="rounded-lg"
                  onClick={() => setOpen(true)}
                  disabled={!isEditable || capturing || submitting}
                >
                  다시 작성
                </LgButton>

                <LgButton
                  className="rounded-lg"
                  onClick={handleSubmitUpload}
                  disabled={!isEditable || submitting}
                >
                  {submitting ? "제출 중..." : "제출하기"}
                </LgButton>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <LgButton
                className="rounded-lg"
                onClick={() => setOpen(true)}
                disabled={!isEditable}
              >
                신청서 작성하기
              </LgButton>
            </div>
          )}
        </div>
      </div>

      {/* ===== 모달 ===== */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="h-full w-full overflow-y-auto py-8">
            <div className="mx-auto w-[860px] max-w-[calc(100vw-32px)]">
              <div className="bg-white rounded-xl shadow-xl max-h-[calc(100vh-4rem)] flex flex-col">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">입양 신청서 양식</p>
                      <p className="mt-1 text-sm text-gray-500">
                        PDF 위에 입력한 내용을 PDF로 생성해 첨부합니다. (제출하기를 눌러 업로드)
                      </p>
                      {modalError ? <p className="mt-3 text-xs text-red-600">{modalError}</p> : null}
                    </div>

                    <LgButton
                      variant="outline"
                      className="rounded-lg"
                      onClick={() => setOpen(false)}
                      disabled={capturing}
                    >
                      닫기
                    </LgButton>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div ref={overlayCaptureRef} data-capture-root>
                    <AdoptionPdfOverlay
                      fileUrl={pdfUrl}
                      values={values}
                      onChange={setValues}
                      mode={overlayMode}
                    />
                  </div>
                </div>

                <div className="border-t p-4 flex justify-end gap-2 bg-white sticky bottom-0">
                  <LgButton
                    onClick={() => setValues(createDefaultContractOverlayValues())}
                    disabled={capturing}
                  >
                    초기화
                  </LgButton>
                  <LgButton onClick={handleConfirmCapture} disabled={capturing || !isEditable}>
                    {capturing ? "PDF 생성 중..." : "확인"}
                  </LgButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
