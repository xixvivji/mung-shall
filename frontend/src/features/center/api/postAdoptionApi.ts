// src/features/center/api/postAdoptionApi.ts
import { api } from "@/shared/api/client";

/** Swagger-aligned types (조회 전용) */

export type PostAdoptionStepSummary = {
  id: number;
  stepName: string;
  description?: string;
  stepOrder: number;
  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
};

export type PostAdoptionProcessResponse = {
  id: number; // postAdoptionId
  adoptionId: number;
  createdAt: string;
  updatedAt: string;
  steps: PostAdoptionStepSummary[];
};

export type PostAdoptionChecklistItem = {
  id: number;
  itemText: string;
  checked: boolean;
  required: boolean;
  category: string;
};

export type PostAdoptionSubmissionItem = {
  id: number;
  submissionName: string;
  description?: string;
  submitted: boolean;
  required: boolean;
  type: string;
  fileUrl?: string;
  originalFileName?: string;
  category: string;
};

export type PostAdoptionStepDetailResponse = {
  id: number;
  postAdoptionId: number;
  stepName: string;
  description?: string;
  stepOrder: number;

  dueDate?: string;
  timeStatus?: string;
  adoptionCompletedAt?: string;

  checklistItems: PostAdoptionChecklistItem[];
  submissionItems: PostAdoptionSubmissionItem[];

  submittedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
};

/** GET /api/post-adoptions/adoption/{adoptionId} */
export async function fetchCenterPostAdoptionProcessByAdoptionId(adoptionId: number) {
  return await api<PostAdoptionProcessResponse>(`/post-adoptions/adoption/${adoptionId}`, {
    method: "GET",
  });
}

/** GET /api/post-adoptions/{postAdoptionId}/steps/{stepOrder} */
export async function fetchCenterPostAdoptionStepDetail(postAdoptionId: number, stepOrder: number) {
  return await api<PostAdoptionStepDetailResponse>(`/post-adoptions/${postAdoptionId}/steps/${stepOrder}`, {
    method: "GET",
  });
}

type UnknownRecord = Record<string, unknown>;

export type ShelterCompletedAdoptionItem = {
  adoptionId: number;
  adoptionProcessStatus: "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dogId: number | null;
  applicantUserId: number | null;
  dogName: string;
  imageUrl: string;
  adopterName: string;
  adopterPhone: string;
  adoptionCompletedAt: string | null;
};

export type PostAdoptionVideoCall = {
  id: number;
  status: string;
  month: number | null;
  scheduledAt: string | null;
  sessionId: string | null;
};

export type UpcomingCompletedAdoptionVideoCall = {
  adoptionId: number;
  postAdoptionId: number;
  month: number | null;
  status: string;
  scheduledAt: string | null;
  sessionId: string | null;
  dogName: string;
  imageUrl: string;
  adopterName: string;
};

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const toText = (value: unknown): string => (typeof value === "string" ? value : "");

const normalizeProcessStatus = (value: unknown): "IN_PROGRESS" | "COMPLETED" | "CANCELLED" => {
  const raw = toText(value).toUpperCase();
  if (raw === "COMPLETED") return "COMPLETED";
  if (raw === "CANCELLED") return "CANCELLED";
  return "IN_PROGRESS";
};

const normalizeShelterCompletedAdoptionItem = (raw: unknown): ShelterCompletedAdoptionItem | null => {
  const record = isRecord(raw) ? raw : {};
  const adoptionId =
    toNumber(
      record.adoptionId ??
        record.adoption_id ??
        record.id ??
        record.processId ??
        record.process_id
    ) ?? null;

  if (!adoptionId || adoptionId <= 0) return null;

  const adoptionProcessStatus = normalizeProcessStatus(
    record.adoptionProcessStatus ??
      record.adoption_process_status ??
      record.processStatus ??
      record.process_status
  );

  return {
    adoptionId,
    adoptionProcessStatus,
    dogId: toNumber(
      record.dogId ??
        record.dog_id ??
        record.abandonedDogId ??
        record.abandoned_dog_id
    ),
    applicantUserId: toNumber(
      record.applicantUserId ??
        record.applicant_user_id ??
        record.adopterUserId ??
        record.adopter_user_id ??
        record.userId ??
        record.user_id
    ),
    dogName: toText(record.dogName ?? record.dog_name ?? record.abandonedDogKindNm ?? record.kindNm),
    imageUrl: toText(record.imageUrl ?? record.image_url ?? record.dogImageUrl ?? record.dog_image_url),
    adopterName: toText(
      record.adopterName ??
        record.adopter_name ??
        record.applicantUsername ??
        record.applicant_username ??
        record.userName ??
        record.user_name
    ),
    adopterPhone: toText(
      record.applicantUserPhone ??
        record.applicant_user_phone ??
        record.adopterPhone ??
        record.adopter_phone ??
        record.phone
    ),
    adoptionCompletedAt:
      toText(
        record.adoptionCompletedAt ??
          record.adoption_completed_at ??
          record.completedAt ??
          record.completed_at
      ) || null,
  };
};

const normalizeVideoCall = (raw: unknown): PostAdoptionVideoCall | null => {
  const record = isRecord(raw) ? raw : {};
  const id = toNumber(record.id ?? record.videoCallId ?? record.video_call_id);
  if (!id || id <= 0) return null;

  return {
    id,
    status: toText(record.status).toUpperCase(),
    month: toNumber(record.month),
    scheduledAt: toText(
      record.scheduledAt ?? record.scheduled_at ?? record.dateTime ?? record.datetime
    ) || null,
    sessionId: toText(
      record.sessionId ??
        record.session_id ??
        record.openViduSessionId ??
        record.openviduSessionId ??
        record.openvidu_session_id
    ) || null,
  };
};

function resolveShelterAdoptionsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];
  if (Array.isArray(raw.dogsWithAdoption)) return raw.dogsWithAdoption;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.content)) return raw.content;
  return [];
}

function resolveVideoCallsList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];
  if (Array.isArray(raw.videoCalls)) return raw.videoCalls;
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.content)) return raw.content;
  return [];
}

export async function fetchShelterCompletedAdoptions(): Promise<ShelterCompletedAdoptionItem[]> {
  try {
    const completedData = await api<unknown>("/shelter/adoptions/dogs?status=COMPLETED");
    const completedFromStatus = resolveShelterAdoptionsList(completedData)
      .map(normalizeShelterCompletedAdoptionItem)
      .filter((item): item is ShelterCompletedAdoptionItem => Boolean(item))
      .filter((item) => item.adoptionProcessStatus === "COMPLETED");
    if (completedFromStatus.length > 0) return completedFromStatus;
  } catch {
    // fallback below
  }
  try {
    const fallback = await api<unknown>("/shelter/adoptions/dogs");
    return resolveShelterAdoptionsList(fallback)
      .map(normalizeShelterCompletedAdoptionItem)
      .filter((item): item is ShelterCompletedAdoptionItem => Boolean(item))
      .filter((item) => item.adoptionProcessStatus === "COMPLETED");
  } catch {
    return [];
  }
}

export async function fetchPostAdoptionByAdoptionId(adoptionId: number) {
  return api<PostAdoptionProcessResponse>(`/post-adoptions/adoption/${adoptionId}`);
}

export async function fetchPostAdoptionVideoCalls(postAdoptionId: number): Promise<PostAdoptionVideoCall[]> {
  const data = await api<unknown>(`/post-adoptions/${postAdoptionId}/video-calls`);
  return resolveVideoCallsList(data)
    .map(normalizeVideoCall)
    .filter((item): item is PostAdoptionVideoCall => Boolean(item));
}

export async function fetchUpcomingVideoCallsByCompletedAdoptions(
  completedAdoptions: ShelterCompletedAdoptionItem[]
): Promise<UpcomingCompletedAdoptionVideoCall[]> {
  const upcoming: UpcomingCompletedAdoptionVideoCall[] = [];

  for (const adoption of completedAdoptions) {
    try {
      const process = await fetchPostAdoptionByAdoptionId(adoption.adoptionId);
      const postAdoptionId = toNumber((process as UnknownRecord).id);
      if (!postAdoptionId || postAdoptionId <= 0) continue;

      const videoCalls = await fetchPostAdoptionVideoCalls(postAdoptionId);
      for (const videoCall of videoCalls) {
        if (videoCall.status !== "UPCOMING") continue;
        upcoming.push({
          adoptionId: adoption.adoptionId,
          postAdoptionId,
          month: videoCall.month,
          status: videoCall.status,
          scheduledAt: videoCall.scheduledAt,
          sessionId: videoCall.sessionId,
          dogName: adoption.dogName,
          imageUrl: adoption.imageUrl,
          adopterName: adoption.adopterName,
        });
      }
    } catch (error) {
      console.warn("[center-consult] failed to resolve post-adoption video calls", {
        adoptionId: adoption.adoptionId,
        error,
      });
    }
  }

  return upcoming;
}

export async function fetchUpcomingVideoCallsForCompletedAdoptions(): Promise<
  UpcomingCompletedAdoptionVideoCall[]
> {
  const completedAdoptions = await fetchShelterCompletedAdoptions();
  return fetchUpcomingVideoCallsByCompletedAdoptions(completedAdoptions);
}
