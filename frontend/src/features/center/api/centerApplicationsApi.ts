import { api, getAccessToken } from "@/shared/api/client";
import type { DocumentType } from "@/features/adoptionApplication/types";

export type ApplicationStatusFilter = "ALL" | "WAITING" | "APPROVED" | "REJECTED";
export type ApplicationStatus = "WAITING" | "APPROVED" | "REJECTED";

export type ShelterAdopterListItem = {
  adoptionId: number;
  applicationId?: number;
  applicantName: string;
  applicantPhone: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  dogId?: number;
  dogKindNm?: string;
  dogDesertionNo?: string;
};

export type ShelterAdoptionDetail = {
  adoptionId: number;
  status: ApplicationStatus;
  applicantName?: string;
  applicantPhone?: string;
  submittedAt?: string | null;
  rejectionReason?: string | null;
  dogId?: number;
  dogKindNm?: string;
  dogDesertionNo?: string;
  applicationId?: number;
};

export type ShelterApplicationDocument = {
  documentId: number;
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
};

export type VerifyAdoptionPayload = {
  isApproved: boolean;
  rejectionReason?: string | null;
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const toText = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const toOptionalText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

const normalizeStatus = (value: unknown): ApplicationStatus => {
  const raw = typeof value === "string" ? value.toUpperCase() : "";
  if (raw === "APPROVED" || raw === "REJECTED" || raw === "WAITING") return raw;
  if (raw === "PENDING") return "WAITING";
  return "WAITING";
};

const normalizeListItem = (raw: unknown): ShelterAdopterListItem => {
  const item = isRecord(raw) ? raw : {};
  const adoptionId =
    toNumber(item.adoptionId ?? item.adoption_id ?? item.id ?? item.adoptionID) ?? 0;
  const applicationId = toNumber(item.applicationId ?? item.application_id);
  return {
    adoptionId,
    applicationId: applicationId ?? undefined,
    applicantName: toText(
      item.applicantName ?? item.adopterName ?? item.name ?? item.applicant_name,
      "이름 없음"
    ),
    applicantPhone: toText(
      item.applicantPhone ?? item.phone ?? item.contact ?? item.applicant_phone,
      "-"
    ),
    status: normalizeStatus(item.status),
    submittedAt: toOptionalText(
      item.submittedAt ?? item.createdAt ?? item.submitted_at ?? item.created_at
    ) ?? null,
    dogId: toNumber(item.dogId ?? item.dog_id) ?? undefined,
    dogKindNm: toText(item.dogKindNm ?? item.dogKindName ?? item.dog_kind_nm, ""),
    dogDesertionNo: toText(item.dogDesertionNo ?? item.desertionNo ?? item.dog_desertion_no, ""),
  };
};

const normalizeDetail = (raw: unknown, adoptionId: number): ShelterAdoptionDetail => {
  const item = isRecord(raw) ? raw : {};
  return {
    adoptionId,
    status: normalizeStatus(item.status),
    applicantName: toOptionalText(item.applicantName ?? item.adopterName ?? item.name),
    applicantPhone: toOptionalText(item.applicantPhone ?? item.phone ?? item.contact),
    submittedAt: toOptionalText(item.submittedAt ?? item.createdAt),
    rejectionReason: toOptionalText(item.rejectionReason ?? item.rejection_reason),
    dogId: toNumber(item.dogId ?? item.dog_id) ?? undefined,
    dogKindNm: toOptionalText(item.dogKindNm ?? item.dogKindName ?? item.dog_kind_nm),
    dogDesertionNo: toOptionalText(item.dogDesertionNo ?? item.desertionNo ?? item.dog_desertion_no),
    applicationId: toNumber(item.applicationId ?? item.application_id) ?? undefined,
  };
};

export async function getShelterAdopters(status: ApplicationStatusFilter) {
  const params = new URLSearchParams();
  if (status && status !== "ALL") params.set("status", status);
  const query = params.toString();
  const data = await api<unknown>(`/shelter/adoptions/adopters${query ? `?${query}` : ""}`);
  const list = Array.isArray(data) ? data : isRecord(data) && Array.isArray(data.items) ? data.items : [];
  return list.map(normalizeListItem);
}

export async function getShelterAdoptionDetail(adoptionId: number): Promise<ShelterAdoptionDetail> {
  const data = await api<unknown>(`/shelter/adoptions/${adoptionId}`);
  return normalizeDetail(data, adoptionId);
}

export async function verifyShelterAdoption(
  adoptionId: number,
  payload: VerifyAdoptionPayload
): Promise<void> {
  await api<void>(`/shelter/adoptions/${adoptionId}/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Legacy document endpoints (Swagger에 없음)
export async function fetchShelterApplicationDocuments(applicationId: number) {
  return api<ShelterApplicationDocument[]>(
    `/shelter/adoptions/applications/${applicationId}/documents`
  );
}

export async function fetchShelterDocumentBlob(documentId: number): Promise<Blob> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`/api/shelter/adoptions/documents/${documentId}`, {
    headers,
    credentials: "omit",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  return response.blob();
}
