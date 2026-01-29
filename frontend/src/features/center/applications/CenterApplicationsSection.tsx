import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  fetchShelterApplications,
  fetchShelterApplicationDocuments,
  fetchShelterDocumentBlob,
  type ApplicationStatusFilter,
  type ShelterApplicationSummary,
  type ShelterApplicationDocument,
} from "../api/centerApplicationsApi";
import type { DocumentType } from "@/features/adoptionApplication/types";

type ApplicationStatus = "WAITING" | "APPROVED" | "REJECTED";

const STATUS_FILTERS: Array<{ value: ApplicationStatusFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "WAITING", label: "대기" },
  { value: "APPROVED", label: "승인" },
  { value: "REJECTED", label: "반려" },
];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WAITING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
};

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  ID_CARD: "신분증 사본",
  FAMILY_CERT: "가족관계증명서",
  LEASE_CONTRACT: "임대차계약서",
};

function statusBadgeVariant(status: ApplicationStatus) {
  if (status === "APPROVED") return "default";
  if (status === "REJECTED") return "destructive";
  return "secondary";
}

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

function docLabel(type: DocumentType) {
  return DOC_TYPE_LABELS[type] ?? type;
}

function isPdfFile(fileName?: string | null) {
  if (!fileName) return false;
  return fileName.toLowerCase().endsWith(".pdf");
}

export function CenterApplicationsSection() {
  const [apps, setApps] = React.useState<ShelterApplicationSummary[]>([]);
  const [selectedId, setSelectedId] = React.useState<number | null>(null);
  const [documents, setDocuments] = React.useState<ShelterApplicationDocument[]>([]);
  const [filter, setFilter] = React.useState<ApplicationStatusFilter>("ALL");

  const [loading, setLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [docsError, setDocsError] = React.useState<string | null>(null);

  const [previewDoc, setPreviewDoc] = React.useState<ShelterApplicationDocument | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setListError(null);

    fetchShelterApplications(filter)
      .then((data) => {
        if (!active) return;
        setApps(data);
        setSelectedId((prev) => {
          if (prev && data.some((item) => item.applicationId === prev)) return prev;
          return data[0]?.applicationId ?? null;
        });
      })
      .catch((err) => {
        if (!active) return;
        setApps([]);
        setSelectedId(null);
        setListError(err instanceof Error ? err.message : "신청 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter]);

  React.useEffect(() => {
    if (!selectedId) {
      setDocuments([]);
      setDocsError(null);
      return;
    }

    let active = true;
    setDocsLoading(true);
    setDocsError(null);

    fetchShelterApplicationDocuments(selectedId)
      .then((data) => {
        if (!active) return;
        setDocuments(data);
      })
      .catch((err) => {
        if (!active) return;
        setDocuments([]);
        setDocsError(err instanceof Error ? err.message : "서류 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (!active) return;
        setDocsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  React.useEffect(() => {
    setPreviewDoc(null);
    setPreviewError(null);
    setPreviewLoading(false);
    setPreviewUrl(null);
  }, [selectedId]);

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const selected = React.useMemo(
    () => apps.find((a) => a.applicationId === selectedId) ?? null,
    [apps, selectedId]
  );

  const handleOpen = async (doc: ShelterApplicationDocument) => {
    setDocsError(null);
    try {
      const blob = await fetchShelterDocumentBlob(doc.documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      setDocsError(err instanceof Error ? err.message : "파일을 열 수 없습니다.");
    }
  };

  const handlePreview = async (doc: ShelterApplicationDocument) => {
    setPreviewDoc(doc);
    setPreviewError(null);

    if (!isPdfFile(doc.fileName)) {
      setPreviewUrl(null);
      setPreviewLoading(false);
      setPreviewError("PDF 파일만 미리보기가 가능합니다.");
      return;
    }

    setPreviewLoading(true);
    try {
      const blob = await fetchShelterDocumentBlob(doc.documentId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      setPreviewUrl(null);
      setPreviewError(err instanceof Error ? err.message : "미리보기를 불러오지 못했습니다.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const listCount = apps.length;

  return (
    <Card className="rounded-3xl border-slate-200/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">입양 신청</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              신청자 서류를 확인하고 보호소 승인/반려에 참고하세요.
            </CardDescription>
          </div>

          <div className="flex gap-2">
            {STATUS_FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={[
                  "rounded-xl border px-3 py-2 text-sm transition",
                  filter === item.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-3 text-sm font-medium text-slate-900">
              신청 목록 ({listCount})
            </div>

            <div className="max-h-[520px] overflow-auto p-2">
              {loading ? (
                <div className="p-6 text-sm text-slate-500">목록을 불러오는 중...</div>
              ) : listError ? (
                <div className="p-6 text-sm text-red-600">{listError}</div>
              ) : listCount === 0 ? (
                <div className="p-6 text-sm text-slate-500">현재 신청이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {apps.map((item) => {
                    const active = item.applicationId === selectedId;
                    const statusLabel = STATUS_LABELS[item.status as ApplicationStatus] ?? item.status;
                    return (
                      <button
                        key={item.applicationId}
                        type="button"
                        onClick={() => setSelectedId(item.applicationId)}
                        className={[
                          "w-full rounded-2xl border p-3 text-left transition",
                          active
                            ? "border-slate-900 bg-slate-900/5"
                            : "border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                            No Image
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-sm font-semibold text-slate-900">
                                {item.applicantName}
                              </div>
                              <Badge variant={statusBadgeVariant(item.status as ApplicationStatus) as any}>
                                {statusLabel}
                              </Badge>
                            </div>

                            <div className="mt-0.5 truncate text-xs text-slate-600">
                              {item.dogKindNm} · desertionNo {item.dogDesertionNo}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              제출 {formatDateTime(item.submittedAt)}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            {!selected ? (
              <div className="flex h-[520px] items-center justify-center text-sm text-slate-500">
                신청을 선택해주세요.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-500">
                    No Image
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-base font-semibold text-slate-900">
                        {selected.applicantName} 신청
                      </div>
                      <Badge variant={statusBadgeVariant(selected.status as ApplicationStatus) as any}>
                        {STATUS_LABELS[selected.status as ApplicationStatus] ?? selected.status}
                      </Badge>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {selected.dogKindNm} · desertionNo {selected.dogDesertionNo}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      연락처 {selected.applicantPhone} · 제출 {formatDateTime(selected.submittedAt)}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">제출 서류</div>
                    {docsLoading && <span className="text-xs text-slate-500">불러오는 중...</span>}
                  </div>

                  {docsError && <p className="mt-2 text-xs text-red-600">{docsError}</p>}

                  <div className="mt-3 space-y-2">
                    {documents.length === 0 ? (
                      <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
                        제출된 서류가 없습니다.
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <div key={doc.documentId} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm text-slate-900">
                              {docLabel(doc.type)} · {doc.fileName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              업로드 {formatDateTime(doc.uploadedAt)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                              onClick={() => handleOpen(doc)}
                            >
                              열기
                            </button>
                            <button
                              type="button"
                              className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                              onClick={() => handlePreview(doc)}
                            >
                              미리보기
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">미리보기</div>
                    <div className="text-xs text-slate-500">
                      {previewDoc ? docLabel(previewDoc.type) : "문서를 선택해주세요"}
                    </div>
                  </div>

                  <div className="mt-3">
                    {previewLoading ? (
                      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                        미리보기를 불러오는 중...
                      </div>
                    ) : previewError ? (
                      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-red-600">
                        {previewError}
                      </div>
                    ) : previewUrl ? (
                      <div className="h-[320px] overflow-hidden rounded-xl border border-slate-200">
                        <iframe
                          title="document-preview"
                          src={previewUrl}
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                        미리보기할 문서를 선택해주세요.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">처리</div>
                  <p className="mt-2 text-xs text-slate-500">
                    승인/반려 기능은 추후 연동 예정입니다.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500"
                    >
                      승인하기
                    </button>
                    <button
                      type="button"
                      disabled
                      className="cursor-not-allowed rounded-xl bg-slate-200 px-3 py-2 text-sm font-medium text-slate-500"
                    >
                      반려하기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
