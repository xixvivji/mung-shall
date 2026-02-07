import { api } from "@/shared/api/client";

import type {
  AdoptionDetail,
  AdoptionContractResponse,
  AdoptionDocumentResponse,
  AdoptionDocumentUploadResponse,
  AdoptionStepInstance,
  AdoptionStepStatus,
  EducationCertResponse,
} from "@/features/manage/types";

import type { AdoptionStepsStatusResponse } from "@/features/adoption/api/adoptionApi";

import type {
  PostAdoptionProcess,
  PostAdoptionStep,
  PostAdoptionStepStatus,
} from "@/features/mypage/types";

import type { DocumentType } from "@/features/adoptionApplication/types";


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
  // DEBUG: steps/status API call tracing
  console.debug("[postAdoption] fetchAdoptionDetail", {
    adoptionId,
    hasSignal: Boolean(options.signal),
    stack: new Error().stack,
  });
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

export async function fetchAdoptionStepStatuses(
  adoptionId: number,
  options: RequestInit = {}
): Promise<AdoptionStepsStatusResponse> {
  // 변경 이유: 문서 단계 상태 확인용 steps/status API 분리
  return api<AdoptionStepsStatusResponse>(`/adoptions/${adoptionId}/steps/status`, options);
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
  // 변경 이유: Swagger 기준 키 + multipart/form-data는 브라우저가 boundary를 설정하도록 유지
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

export async function listAdoptionDocuments(
  adoptionId: number
): Promise<AdoptionDocumentResponse[]> {
  // 변경 이유: 문서 목록 조회 API를 명시적으로 분리
  return fetchAdoptionDocuments(adoptionId);
}

export async function uploadAdoptionDocuments(
  adoptionId: number,
  files: File[],
  documentTypes: DocumentType[]
): Promise<void> {
  if (files.length !== documentTypes.length) {
    throw new Error("files and documentTypes length mismatch.");
  }
  // 변경 이유: Swagger 경로에 맞춰 문서별로 병렬 업로드
  await Promise.all(
    files.map((file, index) =>
      uploadAdoptionDocument(adoptionId, documentTypes[index], file)
    )
  );
}

export async function uploadAdoptionDocument(
  adoptionId: number,
  type: DocumentType,
  file: File
): Promise<AdoptionDocumentUploadResponse> {
  const formData = new FormData();
  // 변경 이유: Swagger 기준 단일 file 필드 업로드
  formData.append("file", file);

  const url = `/adoptions/${adoptionId}/documents/${type}`;
  if (import.meta.env.DEV) {
    console.debug("[documents] upload", {
      adoptionId,
      documentType: type,
      fileName: file.name,
      url,
    });
  }

  return api<AdoptionDocumentUploadResponse>(url, {
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

// =======================
// Post-Adoption (Swagger)
// =======================

export type PostAdoptionChecklistItem = {
  id: number;
  itemText: string;
  checked: boolean;
  required: boolean;
  category: string; // e.g. "ADOPTER_CHECKLIST"
};

export type PostAdoptionSubmissionItem = {
  id: number;
  submissionName: string;
  description?: string | null;
  submitted: boolean;
  required: boolean;
  type: string; // e.g. "IMAGE"
  fileUrl?: string | null;
  originalFileName?: string | null;
  category?: string | null;
};

export type PostAdoptionStepDetailResponse = {
  id: number;
  postAdoptionId: number;
  stepName: string;
  description?: string | null;
  stepOrder: number;
  dueDate?: string | null;
  timeStatus?: string | null;
  adoptionCompletedAt?: string | null;

  checklistItems: PostAdoptionChecklistItem[];
  submissionItems: PostAdoptionSubmissionItem[];

  submittedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

export type PostAdoptionProcessStepSummary = {
  id: number;
  stepName: string;
  description?: string | null;
  stepOrder: number;
  submittedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

export type PostAdoptionProcessResponse = {
  id: number;
  adoptionId: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  steps?: PostAdoptionProcessStepSummary[];
};

// 1) adoptionId로 프로세스 조회 (GET /api/post-adoptions/adoption/{adoptionId})
export function fetchPostAdoptionProcessByAdoptionId(
  adoptionId: number,
  options: RequestInit = {}
): Promise<PostAdoptionProcessResponse> {
  return api<PostAdoptionProcessResponse>(`/post-adoptions/adoption/${adoptionId}`, options);
}

// 2) step 상세 (GET /api/post-adoptions/{postAdoptionId}/steps/{stepOrder})
export function fetchPostAdoptionStepDetail(
  postAdoptionId: number,
  stepOrder: number,
  options: RequestInit = {}
): Promise<PostAdoptionStepDetailResponse> {
  return api<PostAdoptionStepDetailResponse>(
    `/post-adoptions/${postAdoptionId}/steps/${stepOrder}`,
    options
  );
}

// 3) 체크리스트 토글 (PATCH /api/post-adoptions/{postAdoptionId}/steps/{stepOrder}/checklist/{checklistItemId})
export function updatePostAdoptionChecklistItem(
  postAdoptionId: number,
  stepOrder: number,
  checklistItemId: number,
  checked: boolean
): Promise<PostAdoptionStepDetailResponse> {
  return api<PostAdoptionStepDetailResponse>(
    `/post-adoptions/${postAdoptionId}/steps/${stepOrder}/checklist/${checklistItemId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ checklistItemId, checked }),
    }
  );
}

// 4) 제출 파일 업로드 (POST /api/post-adoptions/{postAdoptionId}/steps/{stepOrder}/submissions/{submissionId})
export function uploadPostAdoptionSubmissionFile(
  postAdoptionId: number,
  stepOrder: number,
  submissionId: number,
  file: File
): Promise<PostAdoptionStepDetailResponse> {
  const formData = new FormData();
  // Swagger 기준 key = "file"
  formData.append("file", file);

  return api<PostAdoptionStepDetailResponse>(
    `/post-adoptions/${postAdoptionId}/steps/${stepOrder}/submissions/${submissionId}`,
    { method: "POST", body: formData }
  );
}

// 5) 제출 파일 삭제 (DELETE /api/post-adoptions/{postAdoptionId}/steps/{stepOrder}/submissions/{submissionId})
export function deletePostAdoptionSubmissionFile(
  postAdoptionId: number,
  stepOrder: number,
  submissionId: number
): Promise<PostAdoptionStepDetailResponse> {
  return api<PostAdoptionStepDetailResponse>(
    `/post-adoptions/${postAdoptionId}/steps/${stepOrder}/submissions/${submissionId}`,
    { method: "DELETE" }
  );
}
