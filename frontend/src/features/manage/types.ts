export type LikedDog = {
  dogId?: number;
  desertionNo?: string;
  noticeNo?: string;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
  id?: string;
  name?: string;
  breed?: string;
  centerName?: string;
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

export type StepStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "ACTIVE"
  | "CANCELLED"
  | (string & {});

export type AdoptionStepStatus = StepStatus;

export type AdoptionProcessStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type AdoptionStatusSummary = {
  adoptionId: number;
  dogId: number;
  userId?: number;
  imageUrl?: string;
  kindNm?: string;
  age?: string;
  weight?: string;
  careNm?: string;
  processStatus?: AdoptionProcessStatus | null;
};

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

export type AdoptionStepInstanceResponse = {
  id: number;
  stepDef: {
    stepOrder: number;
    stepName: string;
    description: string;
  };
  status: StepStatus;
  submittedAt?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
};

export type AdoptionDetail = {
  id: number;
  userId?: number | null;
  userName?: string | null;
  dogId?: number | null;
  processStatus?: AdoptionProcessStatus | null;
  status?: string | null;
  rejectionReason?: string | null;
  steps: AdoptionStepInstance[];
};

export type EducationCertResponse = {
  id: number;
  stepInstanceId: number;
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string;
  certificateFileUrl: string;
};

export type AdoptionEducationCertUploadRequest = {
  educationInstitution: string;
  certificateNumber: string;
  completionDate: string;
  certificateFile: File;
};

export type AdoptionEducationCertResponse = EducationCertResponse;

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

export type AdoptionDocumentItem = {
  id?: number | null;
  documentType: string;
  originalFileName: string;
  filePath?: string | null;
  fileSize?: number | null;
};

export type AdoptionDocumentUploadResponse = {
  documentId: number;
};
