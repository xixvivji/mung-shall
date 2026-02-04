import { api, ApiError, getAccessToken } from "@/shared/api/client";

/** 목록 조회 필터(=입양 진행 상태) */
export type AdoptionProcessStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/** 입양 최종 상태 */
export type AdoptionFinalStatus = "APPROVED" | "REJECTED" | "WAITING" | "PENDING";

/** 단계 상태 */
export type AdoptionStepStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED";

/** GET /api/shelter/adoptions/dogs 응답 아이템 (dogsWithAdoption[]) */
export type ShelterDogWithAdoptionItem = {
  abandonedDogId: number;
  abandonedDogKindNm: string;
  abandonedDogDesertionNo: string;
  dogImageUrl: string;

  adoptionId: number;

  applicantUserId: number;
  applicantUsername: string;
  applicantUserEmail: string;
  applicantUserPhone: string;

  adoptionProcessStatus: AdoptionProcessStatus;

  currentStepName: string;
  currentStepStatus: AdoptionStepStatus;
  currentStepOrder: number;
};

/** GET /api/shelter/adoptions/dogs 응답 */
export type ShelterDogsWithAdoptionResponse = {
  dogsWithAdoption: ShelterDogWithAdoptionItem[];
  totalCount: number;
};

/** (공통 스키마) GET /api/shelter/adoptions/{adoptionId}, GET /api/adoptions/{adoptionId}/steps/status 응답 */
export type ShelterAdoptionStepSummary = {
  id: number; // step instance id
  status: AdoptionStepStatus;
};

export type ShelterAdoptionDetail = {
  id: number; // adoption process id
  userId: number;
  userName: string;
  dogId: number;
  processStatus: AdoptionProcessStatus;
  status: AdoptionFinalStatus;
  rejectionReason?: string | null;
  steps: ShelterAdoptionStepSummary[];
};

/** POST verify payload */
export type VerifyPayload = {
  isApproved: boolean;
  rejectionReason?: string | null;
};

export type PostAdoptionStepStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED";

export type PostAdoptionStepDetail = {
  id: number; // stepInstanceId
  stepName: string;
  description: string;
  stepOrder: number;
  status: PostAdoptionStepStatus;
  submittedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

/* ---------------------------------------
 * Debug utils
 * ------------------------------------- */
const DEV = import.meta.env.DEV;

function maskToken(token: string | null) {
  if (!token) return null;
  return `${token.slice(0, 12)}...`;
}

function debugRequest(tag: string, path: string, meta?: Record<string, unknown>) {
  if (!DEV) return;

  const token = getAccessToken();
  console.groupCollapsed(`[http] ${tag}`);
  console.log("path:", path);
  console.log("hasToken:", Boolean(token));
  console.log("tokenMasked:", maskToken(token));
  if (meta) console.log("meta:", meta);
  console.groupEnd();
}

function debugError(tag: string, path: string, err: unknown) {
  if (!DEV) return;

  if (err instanceof ApiError) {
    console.groupCollapsed(`[http] ❌ ${tag} -> ApiError(${err.status})`);
    console.log("path:", path);
    console.log("message:", err.message);
    console.log(
      "hint:",
      "Network 탭에서 해당 요청 클릭 → Response/Preview에서 서버 에러 바디 확인"
    );
    console.groupEnd();
    return;
  }

  console.groupCollapsed(`[http] ❌ ${tag} -> Unknown error`);
  console.log("path:", path);
  console.log(err);
  console.groupEnd();
}

/* ---------------------------------------
 * Utils: 안전한 파싱
 * ------------------------------------- */
type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const toNumber = (v: unknown, fallback = 0) => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

const toText = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

const normalizeProcessStatus = (v: unknown): AdoptionProcessStatus => {
  const raw = typeof v === "string" ? v.toUpperCase() : "";
  if (raw === "IN_PROGRESS" || raw === "COMPLETED" || raw === "CANCELLED") return raw;
  return "IN_PROGRESS";
};

const normalizeFinalStatus = (v: unknown): AdoptionFinalStatus => {
  const raw = typeof v === "string" ? v.toUpperCase() : "";
  if (raw === "APPROVED" || raw === "REJECTED" || raw === "WAITING" || raw === "PENDING") return raw;
  return "WAITING";
};

const normalizeStepStatus = (v: unknown): AdoptionStepStatus => {
  const raw = typeof v === "string" ? v.toUpperCase() : "";
  if (
    raw === "NOT_STARTED" ||
    raw === "SUBMITTED" ||
    raw === "APPROVED" ||
    raw === "REJECTED" ||
    raw === "IN_PROGRESS" ||
    raw === "COMPLETED"
  ) {
    return raw;
  }
  return "NOT_STARTED";
};

const normalizeDogWithAdoptionItem = (raw: unknown): ShelterDogWithAdoptionItem => {
  const r = isRecord(raw) ? raw : {};

  return {
    abandonedDogId: toNumber((r as any).abandonedDogId ?? (r as any).abandoned_dog_id ?? (r as any).dogId ?? (r as any).dog_id),
    abandonedDogKindNm: toText((r as any).abandonedDogKindNm ?? (r as any).abandoned_dog_kind_nm),
    abandonedDogDesertionNo: toText((r as any).abandonedDogDesertionNo ?? (r as any).abandoned_dog_desertion_no),
    dogImageUrl: toText((r as any).dogImageUrl ?? (r as any).dog_image_url),

    adoptionId: toNumber((r as any).adoptionId ?? (r as any).adoption_id ?? (r as any).id),

    applicantUserId: toNumber((r as any).applicantUserId ?? (r as any).applicant_user_id ?? (r as any).userId ?? (r as any).user_id),
    applicantUsername: toText((r as any).applicantUsername ?? (r as any).applicant_username ?? (r as any).userName ?? (r as any).user_name),
    applicantUserEmail: toText((r as any).applicantUserEmail ?? (r as any).applicant_user_email ?? (r as any).userEmail ?? (r as any).user_email),
    applicantUserPhone: toText((r as any).applicantUserPhone ?? (r as any).applicant_user_phone ?? (r as any).userPhone ?? (r as any).user_phone),

    adoptionProcessStatus: normalizeProcessStatus(
      (r as any).adoptionProcessStatus ?? (r as any).adoption_process_status ?? (r as any).processStatus ?? (r as any).process_status
    ),

    currentStepName: toText((r as any).currentStepName ?? (r as any).current_step_name),
    currentStepStatus: normalizeStepStatus((r as any).currentStepStatus ?? (r as any).current_step_status),
    currentStepOrder: toNumber((r as any).currentStepOrder ?? (r as any).current_step_order),
  };
};

const normalizeDogsWithAdoptionResponse = (raw: unknown): ShelterDogsWithAdoptionResponse => {
  const r = isRecord(raw) ? raw : {};
  const listRaw = Array.isArray((r as any).dogsWithAdoption)
    ? ((r as any).dogsWithAdoption as unknown[])
    : [];

  return {
    dogsWithAdoption: listRaw.map(normalizeDogWithAdoptionItem),
    totalCount: toNumber((r as any).totalCount),
  };
};

const normalizeAdoptionDetail = (raw: unknown): ShelterAdoptionDetail => {
  const r = isRecord(raw) ? raw : {};
  const stepsRaw = Array.isArray((r as any).steps) ? ((r as any).steps as unknown[]) : [];

  return {
    id: toNumber((r as any).id ?? (r as any).adoptionId ?? (r as any).adoption_id),
    userId: toNumber((r as any).userId ?? (r as any).user_id),
    userName: toText((r as any).userName ?? (r as any).user_name),
    dogId: toNumber((r as any).dogId ?? (r as any).dog_id),
    processStatus: normalizeProcessStatus((r as any).processStatus ?? (r as any).process_status),
    status: normalizeFinalStatus((r as any).status),
    rejectionReason:
      typeof (r as any).rejectionReason === "string"
        ? ((r as any).rejectionReason as string)
        : typeof (r as any).rejection_reason === "string"
          ? ((r as any).rejection_reason as string)
          : null,
    steps: stepsRaw.map((s) => {
      const sr = isRecord(s) ? s : {};
      return {
        id: toNumber((sr as any).id ?? (sr as any).stepInstanceId ?? (sr as any).step_instance_id),
        status: normalizeStepStatus((sr as any).status),
      };
    }),
  };
};

/* ---------------------------------------
 * API functions
 * ------------------------------------- */

/**
 * 보호소 강아지 입양 목록 조회 (상태별 + 총 개수)
 * GET /api/shelter/adoptions/dogs?status=IN_PROGRESS|COMPLETED|CANCELLED
 */
export async function getShelterDogsWithAdoption(status: AdoptionProcessStatus) {
  const params = new URLSearchParams();
  params.set("status", status);

  const path = `/shelter/adoptions/dogs?${params.toString()}`;

  debugRequest("getShelterDogsWithAdoption", path, { status });

  try {
    const data = await api<unknown>(path);
    return normalizeDogsWithAdoptionResponse(data);
  } catch (err) {
    debugError("getShelterDogsWithAdoption", path, err);
    throw err;
  }
}

/**
 * 보호소 강아지 특정 입양 상세 정보 조회
 * GET /api/shelter/adoptions/{adoptionId}
 */
export async function getShelterAdoptionDetail(adoptionId: number) {
  const path = `/shelter/adoptions/${adoptionId}`;

  debugRequest("getShelterAdoptionDetail", path, { adoptionId });

  try {
    const data = await api<unknown>(path);
    return normalizeAdoptionDetail(data);
  } catch (err) {
    debugError("getShelterAdoptionDetail", path, err);
    throw err;
  }
}

/**
 * [Fallback] 입양 단계별 상태 조회
 * GET /api/adoptions/{adoptionId}/steps/status
 */
export async function getAdoptionStepsStatus(adoptionId: number) {
  const path = `/adoptions/${adoptionId}/steps/status`;

  debugRequest("getAdoptionStepsStatus", path, { adoptionId });

  try {
    const data = await api<unknown>(path);
    return normalizeAdoptionDetail(data);
  } catch (err) {
    debugError("getAdoptionStepsStatus", path, err);
    throw err;
  }
}

/**
 * 입양 최종 승인/반려
 * POST /api/shelter/adoptions/{adoptionId}/verify
 */
export async function verifyShelterAdoption(adoptionId: number, payload: VerifyPayload) {
  const path = `/shelter/adoptions/${adoptionId}/verify`;

  debugRequest("verifyShelterAdoption", path, {
    adoptionId,
    isApproved: payload.isApproved,
    hasReason: Boolean(payload.rejectionReason?.trim()),
  });

  try {
    await api<void>(path, {
      method: "POST",
      body: JSON.stringify({
        isApproved: payload.isApproved,
        rejectionReason: payload.rejectionReason ?? "",
      }),
    });
  } catch (err) {
    debugError("verifyShelterAdoption", path, err);
    throw err;
  }
}

/**
 * 입양 단계 승인/반려
 * POST /api/shelter/adoption-steps/{stepInstanceId}/verify
 */
export async function verifyShelterAdoptionStep(stepInstanceId: number, payload: VerifyPayload) {
  const path = `/shelter/adoption-steps/${stepInstanceId}/verify`;

  debugRequest("verifyShelterAdoptionStep", path, {
    stepInstanceId,
    isApproved: payload.isApproved,
    hasReason: Boolean(payload.rejectionReason?.trim()),
  });

  try {
    await api<void>(path, {
      method: "POST",
      body: JSON.stringify({
        isApproved: payload.isApproved,
        rejectionReason: payload.rejectionReason ?? "",
      }),
    });
  } catch (err) {
    debugError("verifyShelterAdoptionStep", path, err);
    throw err;
  }
}

/** ---------------------------------------
 * Post-adoption step detail (기존 유지)
 * ------------------------------------- */
const normalizePostAdoptionStepDetail = (raw: unknown): PostAdoptionStepDetail => {
  const r = isRecord(raw) ? raw : {};
  return {
    id: toNumber((r as any).id),
    stepName: toText((r as any).stepName),
    description: toText((r as any).description),
    stepOrder: toNumber((r as any).stepOrder),
    status: normalizeStepStatus((r as any).status) as any,
    submittedAt: typeof (r as any).submittedAt === "string" ? (r as any).submittedAt : null,
    completedAt: typeof (r as any).completedAt === "string" ? (r as any).completedAt : null,
    rejectionReason: typeof (r as any).rejectionReason === "string" ? (r as any).rejectionReason : null,
  };
};

export async function getPostAdoptionStepDetail(postAdoptionId: number, stepInstanceId: number) {
  const path = `/post-adoptions/${postAdoptionId}/steps/${stepInstanceId}`;
  debugRequest("getPostAdoptionStepDetail", path, { postAdoptionId, stepInstanceId });
  try {
    const data = await api<unknown>(path);
    return normalizePostAdoptionStepDetail(data);
  } catch (err) {
    debugError("getPostAdoptionStepDetail", path, err);
    throw err;
  }
}

/** ---------------------------------------
 * Generic step detail (기존 유지)
 * ------------------------------------- */
export type AdoptionStepDef = {
  [key: string]: unknown;
};

export type AdoptionStepInstanceResponse = {
  id: number;
  stepDef: AdoptionStepDef;
  status: AdoptionStepStatus;
  approverUserId?: number | null;
  approverUserName?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

const normalizeAdoptionStepInstance = (raw: unknown): AdoptionStepInstanceResponse => {
  const r = isRecord(raw) ? raw : {};
  return {
    id: toNumber((r as any).id),
    stepDef: isRecord((r as any).stepDef) ? ((r as any).stepDef as AdoptionStepDef) : {},
    status: normalizeStepStatus((r as any).status),
    approverUserId: (r as any).approverUserId != null ? toNumber((r as any).approverUserId) : null,
    approverUserName: typeof (r as any).approverUserName === "string" ? (r as any).approverUserName : null,
    submittedAt: typeof (r as any).submittedAt === "string" ? (r as any).submittedAt : null,
    approvedAt: typeof (r as any).approvedAt === "string" ? (r as any).approvedAt : null,
    completedAt: typeof (r as any).completedAt === "string" ? (r as any).completedAt : null,
    rejectionReason: typeof (r as any).rejectionReason === "string" ? (r as any).rejectionReason : null,
  };
};

export async function getAdoptionStepDetail(adoptionId: number, stepOrder: number) {
  const path = `/adoptions/${adoptionId}/steps/${stepOrder}`;
  debugRequest("getAdoptionStepDetail", path, { adoptionId, stepOrder });

  try {
    const data = await api<unknown>(path);
    return normalizeAdoptionStepInstance(data);
  } catch (err) {
    debugError("getAdoptionStepDetail", path, err);
    throw err;
  }
}

/** ---------------------------------------
 * Step 2: education cert
 * ------------------------------------- */
export type AdoptionEducationCertResponse = {
  id: number;
  stepInstanceId: number;
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string; // ISO date-time
  certificateFileUrl: string;
};

const normalizeEducationCert = (raw: unknown): AdoptionEducationCertResponse => {
  const r = isRecord(raw) ? raw : {};
  return {
    id: toNumber((r as any).id),
    stepInstanceId: toNumber((r as any).stepInstanceId ?? (r as any).step_instance_id),
    educationInstitution: toText((r as any).educationInstitution),
    certificateNumber: toText((r as any).certificateNumber),
    completionDate: toText((r as any).completionDate),
    certificateFileUrl: toText((r as any).certificateFileUrl),
  };
};

export async function getAdoptionEducationCert(adoptionId: number) {
  const path = `/adoptions/${adoptionId}/education-cert`;
  debugRequest("getAdoptionEducationCert", path, { adoptionId });

  try {
    const data = await api<unknown>(path);
    return normalizeEducationCert(data);
  } catch (err) {
    debugError("getAdoptionEducationCert", path, err);
    throw err;
  }
}

/** ---------------------------------------
 * Step 4: documents
 * ------------------------------------- */
export type AdoptionDocumentItem = {
  id: number;
  documentType: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
};

const normalizeAdoptionDocuments = (raw: unknown): AdoptionDocumentItem[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = isRecord(item) ? item : {};
    return {
      id: toNumber((r as any).id),
      documentType: toText((r as any).documentType),
      originalFileName: toText((r as any).originalFileName),
      filePath: toText((r as any).filePath),
      fileSize: toNumber((r as any).fileSize),
    };
  });
};


 // GET /api/adoptions/{adoptionId}/documents
export async function getAdoptionDocuments(adoptionId: number): Promise<AdoptionDocumentItem[]> {
  const path = `/adoptions/${adoptionId}/documents`;
  debugRequest("getAdoptionDocuments", path, { adoptionId });

  try {
    const data = await api<unknown>(path);
    return normalizeAdoptionDocuments(data);
  } catch (err) {
    debugError("getAdoptionDocuments", path, err);
    throw err;
  }
}

/** ---------------------------------------
 * Step 4: documents
 * ------------------------------------- */

export type AdoptionContractResponse = {
  id: number;
  stepInstanceId: number;
  contractFileUrl: string;
  originalFileName: string;
  fileSize: number;
  uploadedAt: string;
};

export async function getAdoptionContract(adoptionId: number) {
  const path = `/adoptions/${adoptionId}/contract`;
  debugRequest("getAdoptionContract", path, { adoptionId });

  try {
    return await api<AdoptionContractResponse>(path);
  } catch (err) {
    debugError("getAdoptionContract", path, err);
    throw err;
  }
}


/** ---------------------------------------
 * Step 1: survey
 * ------------------------------------- */
export type AdoptionSurveyResponse = {
  id: number;
  stepInstanceId: number;

  name: string;
  dateOfBirth: string; // date
  gender: string;

  phoneNumber: string;
  email: string;

  address: string;
  detailAddress: string;

  emergencyContacts: Array<any>;

  petPreference: string;

  cohabitantAgreement: boolean;
  hasCohabitant: boolean;
  cohabitantComposition: any;
  cohabitantDetails: Array<any>;

  hasCurrentPets: boolean;
  currentPetDetails: Array<any>;

  hasPastPetExperience: boolean;
  pastPetExperiences: Array<any>;

  residenceType: string;
  isOwner: boolean;

  completedOwnerEducation: boolean;
  agreesToLifetimeCommitment: boolean;
  agreesToFollowUp: boolean;

  job: string;
  workingHours: string;
  aloneTimeManagement: string;

  maritalStatus: string;

  petLivingSpaceLocation: string;
  petLivingSpacePhotoUrl: string;

  monthlyExpenseRange: string;

  agreesToNeutering: boolean;

  motivationForAdoption: string;
  lifeChangeCopingPlan: string;
  travelCopingPlan: string;

  agreesToRegularUpdates: boolean;

  additionalQuestions: string;
};

export async function getAdoptionSurvey(adoptionId: number): Promise<AdoptionSurveyResponse> {
  return api<AdoptionSurveyResponse>(`/adoptions/${adoptionId}/survey`);
}
