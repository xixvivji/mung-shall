export type DocumentType =
  | "RESIDENT_REGISTRATION_COPY"
  | "FAMILY_RELATIONSHIP_CERTIFICATE"
  | "LEASE_AGREEMENT";

export type UploadItem = {
  type: DocumentType;
  file: File;
};
