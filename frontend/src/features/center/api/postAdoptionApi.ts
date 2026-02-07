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
