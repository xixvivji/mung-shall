import { api } from "@/shared/api/client";
import type {
  AdoptionApplicationRequest,
  AdoptionApplicationSubmitResponse,
  AdoptionDocumentUploadResponse,
  DocumentType,
} from "./types";

export async function submitAdoptionApplication(
  payload: AdoptionApplicationRequest
): Promise<AdoptionApplicationSubmitResponse> {
  return api<AdoptionApplicationSubmitResponse>("/adoptions/applications", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadAdoptionDocument(
  applicationId: number,
  type: DocumentType,
  file: File
): Promise<AdoptionDocumentUploadResponse> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);

  return api<AdoptionDocumentUploadResponse>(
    `/adoptions/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: formData,
    }
  );
}
