export type MyDog = {
  id: string;
  name: string;
};

export type LikedDog = {
  id: string;
  name: string;
  breed?: string;
  age?: string;
  imageUrl?: string;
  centerName?: string;
};

export type MyPageSummary = {
  username: string;
  adoptedCount: number;
};

export type AdoptionStep = AdoptionBeforeStep | AdoptionInStep | AdoptionAfterStep;

export type AdoptionBeforeStep =
  | "PROFILE"
  | "SURVEY"
  | "SELECT";

export type AdoptionInStep =
  | "APPLICATION"
  | "EDUCATION_CERT"
  | "CONSULT"
  | "DOCUMENT"
  | "CONTRACT"
  | "APPROVAL";

export type AdoptionAfterStep =
  | "PICKUP"
  | "CARE";

export type AdoptionStepStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "ACTIVE"
  | "SUBMITTED"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type AdoptionProcessStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type AdoptionStepInstance = {
  id: number;
  stepName: string;
  description?: string | null;
  stepOrder?: number | null;
  status: AdoptionStepStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

export type AdoptionDetail = {
  id: number;
  processStatus?: AdoptionProcessStatus | null;
  status?: string | null;
  rejectionReason?: string | null;
  steps: AdoptionStepInstance[];
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

export type EducationCertResponse = {
  id: number;
  stepInstanceId: number;
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string;
  certificateFileUrl: string;
};

export type AdoptionContractResponse = {
  id: number;
  stepInstanceId: number;
  contractFileUrl: string;
  originalFileName: string;
  fileSize: number;
  uploadedAt: string;
};

export type AdoptionDocumentResponse = {
  id: number;
  documentType: string;
  originalFileName: string;
  filePath: string;
  fileSize: number;
};
