import { api } from "@/shared/api/client";
import type { AdoptionSurveyAnswer } from "../model/types";

export type SurveyResponse = {
  id: number;
  userId: number;
  restActivityLevel: NonNullable<AdoptionSurveyAnswer["restActivityLevel"]>;
  residenceType: NonNullable<AdoptionSurveyAnswer["residenceType"]>;
  houseEmptyTime: NonNullable<AdoptionSurveyAnswer["houseEmptyTime"]>;
  furTolerance: NonNullable<AdoptionSurveyAnswer["furTolerance"]>;
  visitorFrequency: NonNullable<AdoptionSurveyAnswer["visitorFrequency"]>;
  createdAt: string;
  updatedAt: string;
};

export type SurveyCreateBody = {
  userId: number;
  restActivityLevel: SurveyResponse["restActivityLevel"];
  residenceType: SurveyResponse["residenceType"];
  houseEmptyTime: SurveyResponse["houseEmptyTime"];
  furTolerance: SurveyResponse["furTolerance"];
  visitorFrequency: SurveyResponse["visitorFrequency"];
};

export type SurveyUpdateBody = Omit<SurveyCreateBody, "userId">;

/** GET /api/recommendation/survey/user/{userId} */
export function getSurvey(userId: number) {
  // DEBUG: recommendation survey GET call tracing
  console.debug("[matching-survey] getSurvey", {
    userId,
    stack: new Error().stack,
  });
  return api<SurveyResponse>(`/recommendation/survey/user/${userId}`, {
    method: "GET",
  });
}

/** POST /api/recommendation/survey */
export function createSurvey(body: SurveyCreateBody) {
  // DEBUG: recommendation survey CREATE call tracing
  console.debug("[matching-survey] createSurvey", {
    userId: body.userId,
    stack: new Error().stack,
  });
  return api<SurveyResponse>(`/recommendation/survey`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** PUT /api/recommendation/survey/user/{userId} */
export function updateSurvey(userId: number, body: SurveyUpdateBody) {
  // DEBUG: recommendation survey UPDATE call tracing
  console.debug("[matching-survey] updateSurvey", {
    userId,
    stack: new Error().stack,
  });
  return api<SurveyResponse>(`/recommendation/survey/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** DELETE /api/recommendation/survey/user/{userId} */
export function deleteSurvey(userId: number) {
  // DEBUG: recommendation survey DELETE call tracing
  console.debug("[matching-survey] deleteSurvey", {
    userId,
    stack: new Error().stack,
  });
  return api<null>(`/recommendation/survey/user/${userId}`, {
    method: "DELETE",
  });
}
