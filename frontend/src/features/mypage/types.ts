export type MyDog = {
  id: string;
  name: string;
};

export type MyPageSummary = {
  username: string;
  adoptedCount: number;
};

export type PostAdoptionStepStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "SUBMITTED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type PostAdoptionProcessStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type PostAdoptionStep = {
  id: number;
  stepName: string;
  description?: string | null;
  stepOrder?: number | null;
  status: PostAdoptionStepStatus;
  submittedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

export type PostAdoptionProcess = {
  id: number;
  adoptionId: number;
  processStatus?: PostAdoptionProcessStatus | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  steps: PostAdoptionStep[];
};
