import { api } from "@/shared/api/client";
import type {
  AdoptionDetail,
  AdoptionContractResponse,
  AdoptionDocumentResponse,
  AdoptionStepInstance,
  AdoptionStepStatus,
  EducationCertResponse,
} from "@/features/manage/types";
import type {
  PostAdoptionProcess,
  PostAdoptionStep,
  PostAdoptionStepStatus,
} from "@/features/mypage/types";

type RawPostAdoptionStep = {
  id?: number;
  stepName?: string;
  description?: string | null;
  stepOrder?: number | null;
  status?: string;
  submittedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

type RawPostAdoptionProcess = {
  id?: number;
  adoptionId?: number;
  processStatus?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  steps?: RawPostAdoptionStep[];
};

type RawAdoptionStepInstance = {
  id?: number;
  status?: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
  stepDef?: {
    stepName?: string;
    description?: string | null;
    stepOrder?: number | null;
  };
};

type RawAdoptionDetail = {
  id?: number;
  processStatus?: string | null;
  status?: string | null;
  rejectionReason?: string | null;
  steps?: RawAdoptionStepInstance[];
};

type RawAdoptionCreateResponse = {
  id?: number;
  adoptionId?: number;
};

type StepVerificationPayload = {
  isApproved: boolean;
  rejectionReason?: string | null;
};

type PostAdoptionCreateRequest = {
  adoptionId: number;
};

type PostAdoptionStepSubmitRequest = {
  data: string;
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

function resolveAdoptionId(data: unknown): number | null {
  if (typeof data === "number") return data;
  if (!isRecord(data)) return null;
  return (
    toNumber(data.id) ??
    toNumber(data.adoptionId) ??
    toNumber(data.adoption_id) ??
    null
  );
}

function normalizePostAdoptionStep(raw: RawPostAdoptionStep): PostAdoptionStep | null {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "number" ? raw.id : NaN;
  if (!Number.isFinite(id)) return null;
  const status = (raw.status ?? "PENDING") as PostAdoptionStepStatus;
  return {
    id,
    stepName: typeof raw.stepName === "string" ? raw.stepName : "",
    description: raw.description ?? null,
    stepOrder: raw.stepOrder ?? null,
    status,
    submittedAt: raw.submittedAt ?? null,
    completedAt: raw.completedAt ?? null,
    rejectionReason: raw.rejectionReason ?? null,
  };
}

function normalizePostAdoptionProcess(raw: RawPostAdoptionProcess): PostAdoptionProcess {
  return {
    id: typeof raw.id === "number" ? raw.id : 0,
    adoptionId: typeof raw.adoptionId === "number" ? raw.adoptionId : 0,
    processStatus: raw.processStatus ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    steps: Array.isArray(raw.steps)
      ? raw.steps
          .map((step) => normalizePostAdoptionStep(step))
          .filter((step): step is PostAdoptionStep => Boolean(step))
      : [],
  };
}

function normalizeAdoptionStep(raw: RawAdoptionStepInstance): AdoptionStepInstance | null {
  if (!raw || typeof raw !== "object") return null;
  const id = typeof raw.id === "number" ? raw.id : NaN;
  if (!Number.isFinite(id)) return null;
  const stepDef = raw.stepDef ?? {};
  const status = (raw.status ?? "PENDING") as AdoptionStepStatus;
  return {
    id,
    stepName: typeof stepDef.stepName === "string" ? stepDef.stepName : "",
    description: stepDef.description ?? null,
    stepOrder: stepDef.stepOrder ?? null,
    status,
    submittedAt: raw.submittedAt ?? null,
    approvedAt: raw.approvedAt ?? null,
    completedAt: raw.completedAt ?? null,
    rejectionReason: raw.rejectionReason ?? null,
  };
}

export async function fetchAdoptionDetail(
  adoptionId: number,
  options: RequestInit = {}
): Promise<AdoptionDetail> {
  const data = await api<RawAdoptionDetail>(
    `/adoptions/${adoptionId}/steps/status`,
    options
  );
  return {
    id: typeof data.id === "number" ? data.id : adoptionId,
    processStatus: data.processStatus ?? null,
    status: data.status ?? null,
    rejectionReason: data.rejectionReason ?? null,
    steps: Array.isArray(data.steps)
      ? data.steps
          .map((step) => normalizeAdoptionStep(step))
          .filter((step): step is AdoptionStepInstance => Boolean(step))
      : [],
  };
}

export async function createAdoptionProcess(): Promise<number> {
  const data = await api<RawAdoptionCreateResponse | unknown>(`/adoptions/`, {
    method: "POST",
  });
  const id = resolveAdoptionId(data);
  if (!id) {
    throw new Error("Failed to resolve adoptionId from create response.");
  }
  return id;
}

export async function startPostAdoptionProcess(adoptionId: number): Promise<PostAdoptionProcess> {
  const data = await api<RawPostAdoptionProcess>("/post-adoptions/start", {
    method: "POST",
    body: JSON.stringify({ adoptionId } satisfies PostAdoptionCreateRequest),
  });
  return normalizePostAdoptionProcess(data);
}

export async function fetchPostAdoptionProcess(postAdoptionId: number): Promise<PostAdoptionProcess> {
  const data = await api<RawPostAdoptionProcess>(`/post-adoptions/${postAdoptionId}`);
  return normalizePostAdoptionProcess(data);
}

export async function cancelPostAdoptionProcess(postAdoptionId: number): Promise<void> {
  await api<void>(`/post-adoptions/${postAdoptionId}`, { method: "DELETE" });
}

export async function fetchPostAdoptionStep(
  postAdoptionId: number,
  stepInstanceId: number
): Promise<PostAdoptionStep | null> {
  const data = await api<RawPostAdoptionStep>(
    `/post-adoptions/${postAdoptionId}/steps/${stepInstanceId}`
  );
  return normalizePostAdoptionStep(data);
}

export async function submitPostAdoptionStep(
  postAdoptionId: number,
  stepInstanceId: number,
  data: string
): Promise<void> {
  await api<void>(`/post-adoptions/${postAdoptionId}/steps/${stepInstanceId}/submit`, {
    method: "POST",
    body: JSON.stringify({ data } satisfies PostAdoptionStepSubmitRequest),
  });
}

export async function verifyPostAdoptionStep(
  postAdoptionId: number,
  stepInstanceId: number,
  payload: StepVerificationPayload
): Promise<void> {
  await api<void>(`/post-adoptions/${postAdoptionId}/steps/${stepInstanceId}/verify`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function completePostAdoptionProcess(postAdoptionId: number): Promise<void> {
  await api<void>(`/post-adoptions/${postAdoptionId}/steps/complete`, { method: "POST" });
}

export async function fetchEducationCert(adoptionId: number): Promise<EducationCertResponse> {
  return api<EducationCertResponse>(`/adoptions/${adoptionId}/education-cert`);
}

export type EducationCertUploadPayload = {
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string;
  certificateFile: File;
};

export async function uploadEducationCert(
  adoptionId: number,
  payload: EducationCertUploadPayload
): Promise<EducationCertResponse> {
  const formData = new FormData();
  formData.append("educationInstitution", payload.educationInstitution);
  formData.append("certificateNumber", payload.certificateNumber);
  formData.append("completionDate", payload.completionDate);
  formData.append("certificateFile", payload.certificateFile);

  return api<EducationCertResponse>(`/adoptions/${adoptionId}/education-cert`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteEducationCert(adoptionId: number): Promise<void> {
  await api<void>(`/adoptions/${adoptionId}/education-cert`, { method: "DELETE" });
}

export async function getAdoptionContract(
  adoptionId: number
): Promise<AdoptionContractResponse> {
  return api<AdoptionContractResponse>(`/adoptions/${adoptionId}/contract`);
}

export async function uploadAdoptionContract(
  adoptionId: number,
  file: File
): Promise<AdoptionContractResponse> {
  const formData = new FormData();
  formData.append("contractFile", file);

  return api<AdoptionContractResponse>(`/adoptions/${adoptionId}/contract`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteAdoptionContract(adoptionId: number): Promise<void> {
  await api<void>(`/adoptions/${adoptionId}/contract`, { method: "DELETE" });
}

export async function fetchAdoptionDocuments(
  adoptionId: number
): Promise<AdoptionDocumentResponse[]> {
  const data = await api<AdoptionDocumentResponse[]>(`/adoptions/${adoptionId}/documents`);
  if (!Array.isArray(data)) return [];
  return data;
}

export async function uploadAdoptionDocument(
  adoptionId: number,
  type: DocumentType,
  file: File
): Promise<void> {
  const formData = new FormData();
  formData.append("files", file);
  formData.append("documentTypes[0]", type);

  await api<void>(`/adoptions/${adoptionId}/documents`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteAdoptionDocument(
  adoptionId: number,
  documentId: number
): Promise<void> {
  await api<void>(`/adoptions/${adoptionId}/documents/${documentId}`, {
    method: "DELETE",
  });
}



