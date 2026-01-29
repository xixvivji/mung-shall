export type DocumentType = "ID_CARD" | "FAMILY_CERT" | "LEASE_CONTRACT";

export type EmergencyContact = {
  contactName: string;
  contactPhoneNumber: string;
  relationship: string;
};

export type CohabitantComposition = {
  numberOfAdults: number;
  numberOfChildren: number;
};

export type CohabitantDetail = {
  relationship: string;
  age: number;
  hasAllergy: boolean;
  adoptionAgreement: boolean;
};

export type CurrentPetDetail = {
  petType: string;
  breed: string;
  count: number;
  age?: number | null;
  neutered: boolean;
  reasonForAdoptingMore?: string;
};

export type PastPetExperience = {
  pastPetType: string;
  pastPetCount: number;
  duration: string;
  isCurrentlyWithYou: boolean;
  details?: string;
};

export type AdoptionApplicationRequest = {
  id?: number;
  stepInstanceId?: number;
  name: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  phoneNumber: string;
  email: string;
  address: string;
  detailAddress: string;
  emergencyContacts: EmergencyContact[];
  petPreference: "ADULT_DOG" | "PUPPY" | "ANY";
  cohabitantAgreement: boolean;
  hasCohabitant: boolean;
  cohabitantComposition: CohabitantComposition | null;
  cohabitantDetails: CohabitantDetail[];
  hasCurrentPets: boolean;
  currentPetDetails: CurrentPetDetail[];
  hasPastPetExperience: boolean;
  pastPetExperiences: PastPetExperience[];
  residenceType: "MULTI_FAMILY_HOUSE" | "SINGLE_FAMILY_HOUSE" | "APARTMENT" | "STUDIO_APARTMENT" | "OTHER";
  isOwner: boolean;
  completedOwnerEducation: boolean;
  agreesToLifetimeCommitment: boolean;
  agreesToFollowUp: boolean;
  job: string;
  workingHours: string;
  aloneTimeManagement: string;
  maritalStatus: "SINGLE" | "MARRIED" | "DIVORCED" | "OTHER";
  petLivingSpaceLocation: string;
  petLivingSpacePhotoUrl: string;
  monthlyExpenseRange: "RANGE_0_5" | "RANGE_5_10" | "RANGE_10_20" | "RANGE_20_UP" | "NOT_SURE";
  agreesToNeutering: boolean;
  motivationForAdoption: string;
  lifeChangeCopingPlan: string;
  travelCopingPlan: string;
  agreesToRegularUpdates: boolean;
  additionalQuestions: string;
};

export type AdoptionApplicationSubmitResponse = {
  applicationId: number;
};

export type AdoptionDocumentUploadResponse = {
  documentId: number;
  type: DocumentType;
  fileName: string;
};
