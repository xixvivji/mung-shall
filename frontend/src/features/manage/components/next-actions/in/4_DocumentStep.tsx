import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import {
  fetchAdoptionStepStatuses,
  uploadAdoptionDocument,
} from "@/features/postAdoption/api/postAdoptionApi";
import {
  normalizeAdoptionStepsStatusResponse,
  type AdoptionStepStatusItem,
} from "@/features/adoption/api/adoptionApi";
import { resolveServerStepKeyWithIndex } from "@/features/manage/utils/adoptionSteps";
import type { DocumentType } from "@/features/adoptionApplication/types";
import type { AdoptionDocumentItem, StepStatus } from "@/features/manage/types";

type Props = {
  isEditable: boolean;
  onSubmitSuccess: () => void;
  adoptionId: number;
};

type DocKey = "idCard" | "familyCert" | "lease";
type UploadStatus = "idle" | "uploading" | "success" | "error";
type UploadState = Record<DocKey, { status: UploadStatus; error?: string }>;

type DocumentCard = {
  key: DocKey;
  label: string;
  hint: string;
  type: DocumentType;
};

const DOCS: DocumentCard[] = [
  {
    key: "idCard",
    label: "신분증 사본",
    hint: "주민등록증 또는 운전면허증 사본",
    type: "RESIDENT_REGISTRATION_COPY",
  },
  {
    key: "familyCert",
    label: "가족관계증명서",
    hint: "최근 발급본 권장",
    type: "FAMILY_RELATIONSHIP_CERTIFICATE",
  },
  {
    key: "lease",
    label: "임대차계약서",
    hint: "전/월세 계약서 사본(해당 시)",
    type: "LEASE_AGREEMENT",
  },
];

const normalizeStepStatus = (status?: string | null) =>
  typeof status === "string" ? status.trim().toUpperCase() : "";

const findDocumentStepInstance = (steps: AdoptionStepStatusItem[]) =>
  steps.find((step, index) => resolveServerStepKeyWithIndex(step, index) === "DOCUMENT") ?? null;

const createEmptyLocalDocs = () =>
  DOCS.reduce((acc, doc) => {
    acc[doc.type] = null;
    return acc;
  }, {} as Partial<Record<DocumentType, AdoptionDocumentItem | null>>);

function formatFileSize(size?: number | null) {
  if (!Number.isFinite(size) || !size || size <= 0) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || fallback;
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
  // ✅ DocumentStep 전용: 기본 mypage(파란 버튼) + size default 통일
  const LgButton = ({
    variant = "mypage",
    className,
    ...props
  }: React.ComponentProps<typeof Button>) => (
    <Button variant={variant} size="default" className={className} {...props} />
  );

  const [docStepStatus, setDocStepStatus] = useState<StepStatus | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const [uploadedByType, setUploadedByType] = useState<
    Partial<Record<DocumentType, AdoptionDocumentItem | null>>
  >(createEmptyLocalDocs);
  const [uploadState, setUploadState] = useState<UploadState>({
    idCard: { status: "idle" },
    familyCert: { status: "idle" },
    lease: { status: "idle" },
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<DocKey, HTMLInputElement | null>>({
    idCard: null,
    familyCert: null,
    lease: null,
  });

  const loadStepStatus = useCallback(async (targetId: number) => {
    setStepError(null);
    try {
      const response = await fetchAdoptionStepStatuses(targetId);
      const steps = normalizeAdoptionStepsStatusResponse(response);
      const documentStep = findDocumentStepInstance(steps);
      if (!documentStep) {
        setDocStepStatus(null);
        setStepError("문서 단계 정보를 찾을 수 없습니다.");
        return;
      }
      setDocStepStatus(normalizeStepStatus(documentStep.status ?? null) as StepStatus);
    } catch (err) {
      setStepError(resolveApiErrorMessage(err, "Failed to load step status."));
      setDocStepStatus(null);
    }
  }, []);

  useEffect(() => {
    if (!adoptionId) {
      setStepError("Adoption ID가 유효하지 않습니다. 페이지를 새로고침 해주세요.");
      return;
    }
    loadStepStatus(adoptionId).catch(() => {});
  }, [adoptionId, loadStepStatus]);

  const uploadedDocuments = useMemo<AdoptionDocumentItem[]>(() => {
    return Object.values(uploadedByType).filter(Boolean) as AdoptionDocumentItem[];
  }, [uploadedByType]);

  const uploadedMap = useMemo(() => {
    const map = new Map<DocumentType, AdoptionDocumentItem>();
    uploadedDocuments.forEach((doc) => map.set(doc.documentType as DocumentType, doc));
    return map;
  }, [uploadedDocuments]);

  const uploadedCount = useMemo(() => uploadedMap.size, [uploadedMap]);
  const allUploaded = DOCS.every((doc) => uploadedMap.has(doc.type));

  const canEdit = isEditable && (docStepStatus === "PENDING" || docStepStatus === "SUBMITTED");
  const canSubmit = isEditable && (docStepStatus === "PENDING" || docStepStatus === "SUBMITTED");
  const canSubmitNow = canSubmit && allUploaded && !submitting;

  const handlePickFile = useCallback(
    async (doc: DocumentCard, file: File | null) => {
      if (!file) return;
      if (!adoptionId) {
        setSubmitError("Adoption ID가 유효하지 않습니다.");
        return;
      }
      if (!canEdit) {
        setSubmitError("현재 단계에서는 업로드할 수 없습니다.");
        return;
      }

      setSubmitError(null);
      setUploadState((prev) => ({ ...prev, [doc.key]: { status: "uploading" } }));

      try {
        const response = await uploadAdoptionDocument(adoptionId, doc.type, file);
        setUploadState((prev) => ({ ...prev, [doc.key]: { status: "success" } }));
        setUploadedByType((prev) => ({
          ...prev,
          [doc.type]: {
            id: response.documentId ?? null,
            documentType: doc.type,
            originalFileName: file.name,
            filePath: null,
            fileSize: file.size,
          },
        }));
      } catch (err) {
        const message = "업로드에 실패했습니다. 다시 시도해주세요.";
        setUploadState((prev) => ({ ...prev, [doc.key]: { status: "error", error: message } }));
        setSubmitError(message);
      }
    },
    [adoptionId, canEdit]
  );

  const handleDelete = useCallback(
    (doc: DocumentCard) => {
      if (!canEdit) {
        setSubmitError("현재 단계에서는 삭제할 수 없습니다.");
        return;
      }
      setUploadedByType((prev) => ({ ...prev, [doc.type]: null }));
      setUploadState((prev) => ({ ...prev, [doc.key]: { status: "idle" } }));
    },
    [canEdit]
  );

  const handleConfirmUpload = useCallback(async () => {
    if (!canSubmitNow) return;
    if (!adoptionId) {
      setSubmitError("Adoption ID가 유효하지 않습니다.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      toast.success("문서 업로드가 완료되었습니다");
      await loadStepStatus(adoptionId);
      onSubmitSuccess();
    } catch (err) {
      setSubmitError(resolveApiErrorMessage(err, "문서 업로드 확인에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }, [adoptionId, canSubmitNow, loadStepStatus, onSubmitSuccess]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Uploaded documents</p>
            <p className="mt-1 text-sm text-gray-500">Review or delete uploaded documents.</p>
          </div>
        </div>

        {stepError ? <p className="mt-2 text-xs text-red-600">{stepError}</p> : null}

        {uploadedDocuments.length === 0 ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
            No uploaded documents yet.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {uploadedDocuments.map((doc) => (
              <div
                key={`${doc.documentType}-${doc.id ?? doc.originalFileName}`}
                className="rounded-2xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {DOCS.find((item) => item.type === doc.documentType)?.label ?? doc.documentType}
                    </p>
                    <p className="mt-1 truncate text-xs text-gray-500">{doc.originalFileName}</p>
                  </div>

                  {/* ✅ 우측 정렬 유지 + 버튼 통일 */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                    <LgButton
                      variant="outline"
                      className="rounded-lg"
                      disabled={!canEdit}
                      onClick={() => {
                        const matched = DOCS.find((item) => item.type === doc.documentType);
                        if (matched) handleDelete(matched);
                      }}
                    >
                      Delete
                    </LgButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">입양 문서 제출</p>
            <p className="mt-1 text-sm text-gray-500">아래 3가지 서류를 각각 첨부한 뒤 제출하세요.</p>
            <p className="mt-2 text-xs text-gray-500">업로드된 파일: {uploadedCount}/3</p>
            {docStepStatus ? <p className="mt-1 text-xs text-gray-400">단계 상태: {docStepStatus}</p> : null}
          </div>

          <span
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
              canSubmit ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-600 border-gray-200"
            }`}
          >
            {canSubmit ? "제출 가능" : "제출 불가"}
          </span>
        </div>

        {/* 항목 3개 */}
        <div className="mt-6 space-y-4">
          {DOCS.map((doc) => {
            const uploaded = uploadedMap.get(doc.type) ?? null;
            const state = uploadState[doc.key];

            return (
              <div key={doc.key} className="rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{doc.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{doc.hint}</p>
                  </div>

                  {/* ✅ 버튼 우측 정렬 */}
                  <div className="flex shrink-0 justify-end gap-2">
                    <LgButton
                      className="rounded-lg"
                      disabled={!canEdit || state.status === "uploading"}
                      onClick={() => fileInputRefs.current[doc.key]?.click()}
                    >
                      첨부하기
                    </LgButton>

                    <input
                      ref={(el) => {
                        fileInputRefs.current[doc.key] = el;
                      }}
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        e.currentTarget.value = "";
                        handlePickFile(doc, file).catch(() => {});
                      }}
                      disabled={!canEdit}
                    />

                    {uploaded ? (
                      <LgButton
                        variant="outline"
                        className="rounded-lg"
                        disabled={!canEdit}
                        onClick={() => handleDelete(doc)}
                      >
                        삭제
                      </LgButton>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                  {!uploaded ? (
                    <p className="text-gray-500">첨부된 파일이 없습니다.</p>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 truncate">{uploaded.originalFileName}</p>
                      <p className="text-gray-500">
                        {formatFileSize(uploaded.fileSize)} · {doc.type}
                      </p>
                    </div>
                  )}
                </div>

                {state.status === "uploading" && <p className="mt-2 text-xs text-blue-600">업로드 중...</p>}
                {state.status === "success" && <p className="mt-2 text-xs text-emerald-600">업로드 완료</p>}
                {state.status === "error" && (
                  <p className="mt-2 text-xs text-red-600">{state.error ?? "업로드에 실패했습니다."}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* 제출 영역 */}
        <div className="mt-6 space-y-2">
          {!canEdit && <p className="text-xs text-gray-500">현재 단계에서는 업로드/삭제가 불가합니다.</p>}
          {canSubmit && !allUploaded && (
            <p className="text-xs text-gray-500">3가지 서류를 모두 업로드해야 제출할 수 있습니다.</p>
          )}

          {/* ✅ 제출 버튼도 우측 정렬 */}
          <div className="flex flex-wrap justify-end gap-3">
            <LgButton className="rounded-lg" disabled={!canSubmitNow} onClick={handleConfirmUpload}>
              {submitting ? "확인 중..." : "문서 제출"}
            </LgButton>
          </div>

          {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}
        </div>
      </div>
    </div>
  );
}
