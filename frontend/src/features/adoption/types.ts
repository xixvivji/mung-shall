export type AdoptionStatus =
  | "NOT_ADOPTED"
  | "ADOPTING_BY_ME"
  | "ADOPTING_BY_OTHERS"
  | "ADOPTED";

export type UserType =
  | "GENERAL"
  | "SHELTER"
  | "GUEST";

export type AdoptionDog = {
  id: string;
  name: string;
  breed: string;
  age: string;
  imageUrl?: string;
  careNm?: string;
  adopting?: boolean;
  processState?: string;
  adoptionStatus?: AdoptionStatus;
};
