import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { ApiError } from "@/shared/api/client";
import { uploadAdoptionDocuments } from "@/features/adoption/api/adoptionDocumentApi";
import type { DocumentType, UploadItem } from "@/features/adoption/types/adoptionDocuments";

type RequiredDoc = {
  key: "idCard" | "familyCert" | "lease";
  label: string;
  type: DocumentType;
};

const REQUIRED_DOCS: RequiredDoc[] = [
  { key: "idCard", label: "신분증 사본", type: "RESIDENT_REGISTRATION_COPY" },
  { key: "familyCert", label: "가족관계증명서", type: "FAMILY_RELATIONSHIP_CERTIFICATE" },
  { key: "lease", label: "임대차계약서", type: "LEASE_AGREEMENT" },
];

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ACCEPT_TYPES = ".pdf,.jpg,.jpeg,.png";

type DocState = { file: File | null; error?: string };
type DocsState = Record<RequiredDoc["key"], DocState>;

function validateFile(file: File): string | null {
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `파일 용량은 ${MAX_FILE_SIZE_MB}MB 이하여야 합니다.`;
  }

  const hasAllowedMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : false;
  const lowerName = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));

  if (!hasAllowedMime && !hasAllowedExt) {
    return "PDF/JPG/PNG 파일만 업로드 가능합니다.";
  }

  return null;
}

function resolveUploadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || "잘못된 요청입니다.";
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.status === 404) return "입양 정보를 찾을 수 없습니다.";
    if (error.status === 409) return "문서 상태가 변경되었습니다. 새로고침 후 다시 시도하세요.";
    if (error.status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.";
    return error.message || "업로드에 실패했습니다.";
  }
  if (error instanceof Error) return error.message || "업로드에 실패했습니다.";
  return "업로드에 실패했습니다.";
}

type Props = {
  adoptionId: number;
};

export default function AdoptionDocumentsUpload({ adoptionId }: Props) {
  const [docs, setDocs] = useState<DocsState>({
    idCard: { file: null },
    familyCert: { file: null },
    lease: { file: null },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const readyToSubmit = useMemo(
    () =>
      REQUIRED_DOCS.every((doc) => docs[doc.key].file) &&
      REQUIRED_DOCS.every((doc) => !docs[doc.key].error) &&
      !isUploading,
    [docs, isUploading]
  );

  const onFileChange = (key: RequiredDoc["key"], file: File | null) => {
    if (!file) {
      setDocs((prev) => ({
        ...prev,
        [key]: { file: null, error: "파일을 선택하세요." },
      }));
      return;
    }
    const error = validateFile(file);
    setDocs((prev) => ({
      ...prev,
      [key]: { file: error ? null : file, error: error ?? undefined },
    }));
  };

  const onSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!adoptionId) {
      setSubmitError("Adoption ID가 유효하지 않습니다.");
      return;
    }

    const missing = REQUIRED_DOCS.filter((doc) => !docs[doc.key].file);
    if (missing.length > 0) {
      setDocs((prev) => {
        const next = { ...prev };
        missing.forEach((doc) => {
          next[doc.key] = { file: null, error: "파일을 선택하세요." };
        });
        return next;
      });
      setSubmitError("필수 서류를 모두 첨부해 주세요.");
      return;
    }

    const items: UploadItem[] = REQUIRED_DOCS.map((doc) => ({
      type: doc.type,
      file: docs[doc.key].file as File,
    }));

    try {
      setIsUploading(true);
      await uploadAdoptionDocuments(adoptionId, items);
      setSubmitSuccess("문서 업로드가 완료되었습니다.");
    } catch (error) {
      setSubmitError(resolveUploadError(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">입양 문서 업로드</p>
          <p className="mt-1 text-sm text-gray-500">
            PDF/JPG/PNG 파일, 최대 {MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다.
          </p>
        </div>

        {REQUIRED_DOCS.map((doc) => (
          <div key={doc.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-800">
              {doc.label}
            </label>
            <input
              type="file"
              accept={ACCEPT_TYPES}
              onChange={(e) => onFileChange(doc.key, e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
              disabled={isUploading}
            />
            {docs[doc.key].file ? (
              <p className="text-xs text-gray-500">
                선택된 파일: {docs[doc.key].file?.name}
              </p>
            ) : null}
            {docs[doc.key].error ? (
              <p className="text-xs text-red-600">{docs[doc.key].error}</p>
            ) : null}
          </div>
        ))}

        <Button className="rounded-lg" disabled={!readyToSubmit} onClick={onSubmit}>
          {isUploading ? "업로드 중..." : "문서 업로드"}
        </Button>

        {submitSuccess ? (
          <p className="text-xs text-emerald-600">{submitSuccess}</p>
        ) : null}
        {submitError ? <p className="text-xs text-red-600">{submitError}</p> : null}
      </div>
    </div>
  );
}
