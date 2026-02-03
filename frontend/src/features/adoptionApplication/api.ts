import { api } from "@/shared/api/client";
import type {
  AdoptionApplicationRequest,
  AdoptionApplicationResponse,
  AdoptionDocumentUploadResponse,
  DocumentType,
} from "./types";

const APPLICATION_PATH = (adoptionId: number | string) =>
  `/adoptions/${adoptionId}/survey`;

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toCamelCaseKey = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

const toSnakeCaseKey = (value: string) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamelCaseDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCaseDeep(item));
  }
  if (isRecord(value)) {
    const out: UnknownRecord = {};
    Object.entries(value).forEach(([key, val]) => {
      out[toCamelCaseKey(key)] = toCamelCaseDeep(val);
    });
    return out;
  }
  return value;
};

const toSnakeCaseDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => toSnakeCaseDeep(item));
  }
  if (isRecord(value)) {
    const out: UnknownRecord = {};
    Object.entries(value).forEach(([key, val]) => {
      out[toSnakeCaseKey(key)] = toSnakeCaseDeep(val);
    });
    return out;
  }
  return value;
};

const useSnakeCase = () => import.meta.env.VITE_API_SNAKE_CASE === "true";

const normalizeApplicationResponse = (data: unknown): AdoptionApplicationResponse => {
  if (!isRecord(data)) return {};
  const normalized = toCamelCaseDeep(data);
  return isRecord(normalized) ? (normalized as AdoptionApplicationResponse) : {};
};

const serializeApplicationPayload = (payload: AdoptionApplicationRequest) => {
  if (!useSnakeCase()) return payload;
  const serialized = toSnakeCaseDeep(payload);
  return isRecord(serialized) ? serialized : payload;
};

export async function getAdoptionApplication(
  adoptionId: number | string
): Promise<AdoptionApplicationResponse> {
  const data = await api<unknown>(APPLICATION_PATH(adoptionId));
  return normalizeApplicationResponse(data);
}

export async function upsertAdoptionApplication(
  adoptionId: number | string,
  payload: AdoptionApplicationRequest
): Promise<AdoptionApplicationResponse> {
  const body = JSON.stringify(serializeApplicationPayload(payload));
  const data = await api<unknown>(APPLICATION_PATH(adoptionId), {
    method: "POST",
    body,
  });
  return normalizeApplicationResponse(data);
}

export async function deleteAdoptionApplication(
  adoptionId: number | string
): Promise<void> {
  await api<void>(APPLICATION_PATH(adoptionId), { method: "DELETE" });
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
