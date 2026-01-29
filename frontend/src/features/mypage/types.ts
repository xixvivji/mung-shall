export type MyDog = {
  id: string;
  name: string;
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