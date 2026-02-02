// src/features/matching-survey/api/surveyUpsert.ts
import { getSurvey, createSurvey, updateSurvey } from "./survey";
import type { AdoptionSurveyAnswer } from "../model/types";
import { ApiError } from "@/shared/api/client";

export async function saveSurveyByUser(userId: number, answer: AdoptionSurveyAnswer) {
  console.log("[saveSurveyByUser] called", userId);

  let exists = true;

  try {
    await getSurvey(userId);
  } catch (e: unknown) {
    if (e instanceof ApiError) {
      console.log("[getSurvey failed]", e.status, e.message);

      // 서버가 "없음"을 404 또는 400으로 주는 경우 모두 대비
      if (e.status === 404 || e.status === 400) {
        exists = false;
      } else {
        throw e;
      }
    } else {
      throw e;
    }
  }

  // 안전장치: 필수값 누락이면 여기서 터트려서 조기 발견
  const { restActivityLevel, residenceType, houseEmptyTime, furTolerance, visitorFrequency } = answer;
  if (!restActivityLevel || !residenceType || !houseEmptyTime || !furTolerance || !visitorFrequency) {
    throw new Error("설문 답변이 완성되지 않았습니다.");
  }

  if (exists) {
    return updateSurvey(userId, {
      restActivityLevel,
      residenceType,
      houseEmptyTime,
      furTolerance,
      visitorFrequency,
    });
  }

  return createSurvey({
    userId,
    restActivityLevel,
    residenceType,
    houseEmptyTime,
    furTolerance,
    visitorFrequency,
  });
}
