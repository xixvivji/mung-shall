import { api, getAccessToken } from "@/shared/api/client";
import type { DocumentType } from "@/features/adoptionApplication/types";

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const API_BASE = RAW_API_BASE.endsWith("/") ? RAW_API_BASE.slice(0, -1) : RAW_API_BASE;

export type ApplicationStatusFilter = "ALL" | "WAITING" | "APPROVED" | "REJECTED";

export type ShelterApplicationSummary = {
  applicationId: number;
  adoptionId: number;
  applicantName: string;
  applicantPhone: string;
  status: "WAITING" | "APPROVED" | "REJECTED";
  submittedAt: string | null;
  dogId: number;
  dogKindNm: string;
  dogDesertionNo: string;
};

export type ShelterApplicationDocument = {
  documentId: number;
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
};

export async function fetchShelterApplications(status: ApplicationStatusFilter) {
  const params = new URLSearchParams({ status });
  return api<ShelterApplicationSummary[]>(`/shelter/adoptions/applications?${params.toString()}`);
}

export async function fetchShelterApplicationDocuments(applicationId: number) {
  return api<ShelterApplicationDocument[]>(
    `/shelter/adoptions/applications/${applicationId}/documents`
  );
}

export async function fetchShelterDocumentBlob(documentId: number): Promise<Blob> {
  const token = getAccessToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}/shelter/adoptions/documents/${documentId}`, {
    headers,
    credentials: "omit",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }

  return response.blob();
}
