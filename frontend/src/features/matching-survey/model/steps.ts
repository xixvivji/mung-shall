export type SurveyStep =
  | "REST_ACTIVITY"
  | "RESIDENCE"
  | "EMPTY_TIME"
  | "FUR"
  | "VISITOR";

export const SURVEY_STEP_ORDER: SurveyStep[] = [
  "REST_ACTIVITY",
  "RESIDENCE",
  "EMPTY_TIME",
  "FUR",
  "VISITOR",
];
