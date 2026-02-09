export type RestActivityLevel =
  | "VERY_ACTIVE"
  | "ACTIVE"
  | "MODERATE"
  | "CALM"
  | "VERY_CALM";

export type ResidenceType =
  | "APARTMENT"
  | "DETACHED_HOUSE"
  | "VILLA"
  | "OFFICETEL"
  | "ETC";

export type HouseEmptyTime =
  | "RARELY"
  | "ONE_TO_FOUR_HOURS"
  | "FOUR_TO_EIGHT_HOURS"
  | "EIGHT_TO_TWELVE_HOURS"
  | "MORE_THAN_TWELVE_HOURS";

export type FurTolerance =
  | "NOT_AT_ALL"
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type VisitorFrequency =
  | "RARELY"
  | "OCCASIONALLY"
  | "FREQUENTLY"
  | "VERY_FREQUENTLY";

export type AdoptionSurveyAnswer = {
  restActivityLevel?: RestActivityLevel;
  residenceType?: ResidenceType;
  houseEmptyTime?: HouseEmptyTime;
  furTolerance?: FurTolerance;
  visitorFrequency?: VisitorFrequency;
};

