export type MyDog = {
  id: string;
  name: string;
};

export type MyPageSummary = {
  username: string;
  adoptedCount: number;
};

export type AdoptionInStep =
  | "APPLICATION"
  | "EDUCATION_CERT"
  | "CONSULT"
  | "DOCUMENT"
  | "CONTRACT"
  | "APPROVAL";