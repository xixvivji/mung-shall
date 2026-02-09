import { api } from "@/shared/api/client";
import type {
  AdoptionApplicationRequest,
  AdoptionApplicationResponse,
  AdoptionDocumentUploadResponse,
  DocumentType,
} from "./types";

const APPLICATION_PATH = (adoptionId: number | string) =>
  `/adoptions/${adoptionId}/survey`;
const DOCUMENTS_PATH = (adoptionId: number | string) =>
  `/adoptions/${adoptionId}/documents`;

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

const normalizeApplicationResponse = (
  data: unknown
): AdoptionApplicationResponse => {
  if (!isRecord(data)) return {};
  const normalized = toCamelCaseDeep(data);
  return isRecord(normalized) ? (normalized as AdoptionApplicationResponse) : {};
};

const normalizeDocumentUploadResponse = (
  data: unknown
): AdoptionDocumentUploadResponse[] => {
  if (Array.isArray(data)) {
    return data as AdoptionDocumentUploadResponse[];
  }
  if (isRecord(data)) {
    return [data as AdoptionDocumentUploadResponse];
  }
  return [];
};

const serializeApplicationPayload = (payload: AdoptionApplicationRequest) => {
  if (!useSnakeCase()) return payload;
  const serialized = toSnakeCaseDeep(payload);
  return isRecord(serialized) ? serialized : payload;
};

export async function getAdoptionApplication(
  adoptionId: number | string,
  options: RequestInit = {}
): Promise<AdoptionApplicationResponse> {
  // DEBUG: adoption survey GET call tracing
  console.debug("[adoptionApplication] getAdoptionApplication", {
    adoptionId,
    hasSignal: Boolean(options.signal),
    stack: new Error().stack,
  });
  const data = await api<unknown>(APPLICATION_PATH(adoptionId), options);
  return normalizeApplicationResponse(data);
}

export async function upsertAdoptionApplication(
  adoptionId: number | string,
  payload: AdoptionApplicationRequest
): Promise<AdoptionApplicationResponse> {
  // DEBUG: adoption survey UPSERT call tracing
  console.debug("[adoptionApplication] upsertAdoptionApplication", {
    adoptionId,
    stack: new Error().stack,
  });
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
  // DEBUG: adoption survey DELETE call tracing
  console.debug("[adoptionApplication] deleteAdoptionApplication", {
    adoptionId,
    stack: new Error().stack,
  });
  await api<void>(APPLICATION_PATH(adoptionId), { method: "DELETE" });
}

export async function getAdoptionDocuments(
  adoptionId: number | string
): Promise<AdoptionDocumentUploadResponse[]> {
  try {
    const data = await api<unknown>(DOCUMENTS_PATH(adoptionId));
    return normalizeDocumentUploadResponse(data);
  } catch (error) {
    const status =
      typeof (error as { status?: number }).status === "number"
        ? (error as { status: number }).status
        : undefined;
    const message =
      typeof (error as { message?: unknown }).message === "string"
        ? (error as { message: string }).message
        : "";

    if (
      status === 403 &&
      message.includes("문서 제출 데이터가 존재하지 않습니다.")
    ) {
      return [];
    }
    throw error;
  }
}

export async function uploadAdoptionDocuments(
  adoptionId: number | string,
  items: Array<{ type: DocumentType; file: File }>
): Promise<AdoptionDocumentUploadResponse[]> {
  const formData = new FormData();
  const mapping: Record<string, DocumentType> = {};
  items.forEach((item, index) => {
    formData.append("files", item.file);
    mapping[`files[${index}]`] = item.type;
  });

  formData.append(
    "documentTypes",
    new Blob([JSON.stringify({ documentTypes: mapping })], {
      type: "application/json",
    })
  );

  const data = await api<unknown>(
    DOCUMENTS_PATH(adoptionId),
    {
      method: "POST",
      body: formData,
    }
  );

  return normalizeDocumentUploadResponse(data);
}

export async function uploadAdoptionDocument(
  adoptionId: number | string,
  type: DocumentType,
  file: File
): Promise<AdoptionDocumentUploadResponse[]> {
  return uploadAdoptionDocuments(adoptionId, [{ type, file }]);
}
