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
    console.log("hint:", "Network 탭에서 해당 요청 클릭 → Response/Preview에서 서버 에러 바디 확인");
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
    abandonedDogId: toNumber(
      (r as any).abandonedDogId ??
        (r as any).abandoned_dog_id ??
        (r as any).dogId ??
        (r as any).dog_id
    ),
    abandonedDogKindNm: toText((r as any).abandonedDogKindNm ?? (r as any).abandoned_dog_kind_nm),
    abandonedDogDesertionNo: toText(
      (r as any).abandonedDogDesertionNo ?? (r as any).abandoned_dog_desertion_no
    ),
    dogImageUrl: toText((r as any).dogImageUrl ?? (r as any).dog_image_url),

    adoptionId: toNumber((r as any).adoptionId ?? (r as any).adoption_id ?? (r as any).id),

    applicantUserId: toNumber(
      (r as any).applicantUserId ??
        (r as any).applicant_user_id ??
        (r as any).userId ??
        (r as any).user_id
    ),
    applicantUsername: toText(
      (r as any).applicantUsername ??
        (r as any).applicant_username ??
        (r as any).userName ??
        (r as any).user_name
    ),
    applicantUserEmail: toText(
      (r as any).applicantUserEmail ??
        (r as any).applicant_user_email ??
        (r as any).userEmail ??
        (r as any).user_email
    ),
    applicantUserPhone: toText(
      (r as any).applicantUserPhone ??
        (r as any).applicant_user_phone ??
        (r as any).userPhone ??
        (r as any).user_phone
    ),

    adoptionProcessStatus: normalizeProcessStatus(
      (r as any).adoptionProcessStatus ??
        (r as any).adoption_process_status ??
        (r as any).processStatus ??
        (r as any).process_status
    ),

    currentStepName: toText((r as any).currentStepName ?? (r as any).current_step_name),
    currentStepStatus: normalizeStepStatus(
      (r as any).currentStepStatus ?? (r as any).current_step_status
    ),
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
 * Step 1: survey
 * ------------------------------------- */
export type AdoptionSurveyResponse = {
  id: number;
  stepInstanceId: number;

  name: string;
  dateOfBirth: string;
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

/** ---------------------------------------
 * Step 2: education cert
 * ------------------------------------- */
export type AdoptionEducationCertResponse = {
  id: number;
  stepInstanceId: number;
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string;
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

/** Step 4: documents (단건 조회 기반) */
export type AdoptionDocumentType =
  | "RESIDENT_REGISTRATION_COPY"
  | "LEASE_AGREEMENT"
  | "FAMILY_RELATIONSHIP_CERTIFICATE";

export type UploadedDocumentResponse = {
  id: number;
  documentType: AdoptionDocumentType;
  originalFileName: string;
  filePath: string;
  fileSize: number;
};

const normalizeUploadedDocument = (raw: unknown): UploadedDocumentResponse => {
  const r = isRecord(raw) ? raw : {};

  const dtRaw = toText((r as any).documentType).toUpperCase();
  const documentType: AdoptionDocumentType =
    dtRaw === "RESIDENT_REGISTRATION_COPY" ||
    dtRaw === "LEASE_AGREEMENT" ||
    dtRaw === "FAMILY_RELATIONSHIP_CERTIFICATE"
      ? (dtRaw as AdoptionDocumentType)
      : "RESIDENT_REGISTRATION_COPY";

  return {
    id: toNumber((r as any).id),
    documentType,
    originalFileName: toText((r as any).originalFileName),
    filePath: toText((r as any).filePath),
    fileSize: toNumber((r as any).fileSize),
  };
};

/** ✅ 단건 조회 */
export async function getAdoptionDocument(adoptionId: number, documentType: AdoptionDocumentType) {
  const path = `/adoptions/${adoptionId}/documents/${documentType}`;
  debugRequest("getAdoptionDocument", path, { adoptionId, documentType });

  try {
    const data = await api<unknown>(path);
    return normalizeUploadedDocument(data);
  } catch (err) {
    debugError("getAdoptionDocument", path, err);
    throw err;
  }
}

export async function getSubmittedAdoptionDocuments(
  adoptionId: number,
  types: AdoptionDocumentType[] = [
    "RESIDENT_REGISTRATION_COPY",
    "LEASE_AGREEMENT",
    "FAMILY_RELATIONSHIP_CERTIFICATE",
  ]
): Promise<UploadedDocumentResponse[]> {
  const results = await Promise.allSettled(types.map((t) => getAdoptionDocument(adoptionId, t)));

  const submitted: UploadedDocumentResponse[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      submitted.push(r.value);
      continue;
    }

    const e = r.reason;

    // ✅ 미제출로 간주: 404 뿐 아니라 400도 포함 (서버가 "not found"를 400으로 주는 케이스 대응)
    if (e instanceof ApiError && (e.status === 404 || e.status === 400)) continue;

    // 그 외는 진짜 에러
    throw e;
  }

  return submitted;
}


/** ✅ (호환용) 기존 함수명 유지 */
export async function getAdoptionDocuments(adoptionId: number) {
  return getSubmittedAdoptionDocuments(adoptionId);
}


/** ---------------------------------------
 * Step 5: contract
 * ------------------------------------- */
export type AdoptionContractResponse = {
  id: number;
  originalFileName: string;
  fileSize: number;
  uploadedAt: string;
  contractFileUrl: string;
};

const normalizeContract = (raw: unknown): AdoptionContractResponse => {
  const r = isRecord(raw) ? raw : {};
  return {
    id: toNumber((r as any).id),
    originalFileName: toText((r as any).originalFileName),
    fileSize: toNumber((r as any).fileSize),
    uploadedAt: toText((r as any).uploadedAt),
    contractFileUrl: toText((r as any).contractFileUrl ?? (r as any).fileUrl ?? (r as any).filePath),
  };
};

export async function getAdoptionContract(adoptionId: number) {
  const path = `/adoptions/${adoptionId}/contract`;
  debugRequest("getAdoptionContract", path, { adoptionId });

  try {
    const data = await api<unknown>(path);
    return normalizeContract(data);
  } catch (err) {
    debugError("getAdoptionContract", path, err);
    throw err;
  }
}
