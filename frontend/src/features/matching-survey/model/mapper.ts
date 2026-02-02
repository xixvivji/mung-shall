// src/features/matching-survey/model/mapper.ts
import type { AdoptionSurveyAnswer } from "./types";
import type { SurveyCreateBody, SurveyResponse } from "../api/survey";

export function toCreateBody(userId: number, answer: AdoptionSurveyAnswer): SurveyCreateBody {
  const { restActivityLevel, residenceType, houseEmptyTime, furTolerance, visitorFrequency } = answer;

  if (!restActivityLevel || !residenceType || !houseEmptyTime || !furTolerance || !visitorFrequency) {
    throw new Error("설문 답변이 완성되지 않았습니다.");
  }

  return { userId, restActivityLevel, residenceType, houseEmptyTime, furTolerance, visitorFrequency };
}

export function toAnswer(dto: SurveyResponse): AdoptionSurveyAnswer {
  return {
    restActivityLevel: dto.restActivityLevel,
    residenceType: dto.residenceType,
    houseEmptyTime: dto.houseEmptyTime,
    furTolerance: dto.furTolerance,
    visitorFrequency: dto.visitorFrequency,
  };
}
