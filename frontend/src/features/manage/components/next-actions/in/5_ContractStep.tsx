import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId?: number;
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
    if (error.status === 404) return "Contract not found.";
    if (error.status === 409) return "The contract status has changed. Please refresh.";
    if (error.status >= 500) return "Server error. Please try again.";
    return error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

export function ContractStep({ isEditable, onSubmitSuccess, adoptionId }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<ContractOverlayValues>(createDefaultContractOverlayValues());
  const [isFormConfirmed, setIsFormConfirmed] = useState(false);
  const [contract, setContract] = useState<AdoptionContractResponse | null>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canUpload = isEditable && !uploading;

  const selectedMeta = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: selectedFile.type || "unknown",
    };
  }, [selectedFile]);

  const loadContract = useCallback(
    async (targetId: number, options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setContractLoading(true);
      setContractError(null);

      try {
        const data = await getAdoptionContract(targetId);
        setContract(data);
        if (import.meta.env.DEV) {
          console.debug("[contract] fetched", data);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setContract(null);
          setContractError(null);
        } else {
          setContract(null);
          setContractError(resolveApiErrorMessage(err, "Failed to load contract."));
        }
      } finally {
        if (!silent) setContractLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!adoptionId) {
      setContract(null);
      setContractError("Missing adoptionId.");
      return;
    }

    loadContract(adoptionId).catch(() => {
      // loadContract handles its own errors
    });
  }, [adoptionId, loadContract]);

  const handleUpload = async () => {
    if (!adoptionId) {
      setContractError("Missing adoptionId.");
      return;
    }
    if (!selectedFile) {
      setContractError("Please select a contract file.");
      return;
    }

    setUploading(true);
    setContractError(null);

    try {
      const response = await uploadAdoptionContract(adoptionId, selectedFile);
      setContract(response);
      setSelectedFile(null);
      onSubmitSuccess();
    } catch (err) {
      setContractError(resolveApiErrorMessage(err, "Failed to upload contract."));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!adoptionId || !contract || deleting) return;
    const confirmed = window.confirm("Delete the contract file?");
    if (!confirmed) return;

    setDeleting(true);
    setContractError(null);

    try {
      await deleteAdoptionContract(adoptionId);
      setContract(null);
      await loadContract(adoptionId, { silent: true });
    } catch (err) {
      setContractError(resolveApiErrorMessage(err, "Failed to delete contract."));
    } finally {
      setDeleting(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">계약서</p>
            <p className="mt-1 text-sm text-gray-500">
              업로드된 계약서를 확인하거나 삭제 후 재업로드하세요.
            </p>
          </div>
          {contractLoading ? <span className="text-xs text-gray-500">로딩 중...</span> : null}
        </div>

        {contractError ? <p className="mt-2 text-xs text-red-600">{contractError}</p> : null}

        {!adoptionId ? (
          <p className="mt-4 text-xs text-gray-500">
            입양 ID가 없습니다. 입양 과정에서 다시 열어주세요.
          </p>
        ) : contract ? (
          <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <div>
              <p className="text-xs font-semibold text-gray-500">파일명</p>
              <p className="text-sm text-gray-900">
                {contract.originalFileName || "계약서 파일"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">업로드 정보</p>
              <p className="text-sm text-gray-900">
                {formatFileSize(contract.fileSize)} · {formatDateTime(contract.uploadedAt)}
              </p>
            </div>
            {contract.contractFileUrl ? (
              <a
                className="inline-flex text-xs font-semibold text-blue-600 hover:underline"
                href={contract.contractFileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                계약서 파일 열기
              </a>
            ) : null}

            <div className="pt-2">
              <Button
                variant="outline"
                className="rounded-lg"
                disabled={!isEditable || deleting}
                onClick={handleDelete}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            업로드된 계약서가 없습니다.
          </div>
        )}

        {contractError && adoptionId ? (
          <div className="mt-4">
            <Button
              variant="outline"
              className="rounded-lg"
              onClick={() => loadContract(adoptionId)}
              disabled={contractLoading}
            >
              다시 시도
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">계약서 업로드</p>
            <p className="mt-1 text-sm text-gray-500">
              서명된 계약서(PDF 권장)를 업로드하세요.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            className="rounded-lg"
            disabled={!canUpload}
            onClick={() => fileInputRef.current?.click()}
          >
            파일 선택
          </Button>

          {selectedFile && (
            <Button
              variant="outline"
              className="rounded-lg"
              disabled={!canUpload}
              onClick={() => setSelectedFile(null)}
            >
              선택 해제
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            disabled={!canUpload}
          />
        </div>

        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
          {!selectedMeta ? (
            <p className="text-gray-500">선택된 파일이 없습니다.</p>
          ) : (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">{selectedMeta.name}</p>
              <p className="text-gray-500">
                {selectedMeta.size} · {selectedMeta.type}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            className="rounded-lg"
            disabled={!canUpload || !selectedFile}
            onClick={handleUpload}
          >
            {uploading ? "업로드 중..." : "업로드"}
          </Button>
          <Button variant="outline" className="rounded-lg" onClick={() => setOpen(true)}>
            계약서 양식 보기
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40">
          {/* 계약서 양식 모달 오버레이 */}
          <div className="h-full w-full overflow-y-auto py-8">
            <div className="mx-auto w-[860px] max-w-[calc(100vw-32px)]">
              {/* 모달 카드 */}
              <div className="bg-white rounded-xl shadow-xl max-h-[calc(100vh-4rem)] flex flex-col">
                {/* 헤더 */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">계약서 양식</p>
                      <p className="mt-1 text-sm text-gray-500">
                        PDF 미리보기 화면입니다. 필요시 내려받아 작성하세요.
                      </p>
                    </div>
                    <Button variant="outline" className="rounded-lg" onClick={() => setOpen(false)}>
                      닫기
                    </Button>
                  </div>
                </div>

                {/* 본문 */}
                <div className="p-6 overflow-y-auto">
                  <AdoptionPdfOverlay fileUrl={pdfUrl} values={values} onChange={setValues} />
                </div>

                {/* 하단 액션 */}
                <div className="border-t p-4 flex justify-end gap-2 bg-white sticky bottom-0">
                  <Button
                    variant="outline"
                    onClick={() => setValues(createDefaultContractOverlayValues())}
                  >
                    초기화
                  </Button>
                  <Button onClick={() => setOpen(false)}>확인</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
