import { getSurvey, createSurvey, updateSurvey } from "../api/survey";
import type { AdoptionSurveyAnswer } from "../model/types";

export async function submitMatchingSurvey(
  userId: number,
  answer: AdoptionSurveyAnswer
) {
  try {
    // 1️⃣ 기존 설문 조회
    await getSurvey(userId);

    // 2️⃣ 있으면 수정
    return await updateSurvey(userId, {
      restActivityLevel: answer.restActivityLevel!,
      residenceType: answer.residenceType!,
      houseEmptyTime: answer.houseEmptyTime!,
      furTolerance: answer.furTolerance!,
      visitorFrequency: answer.visitorFrequency!,
    });
  } catch (err: any) {
    // 3️⃣ 없으면 생성
    if (err?.response?.status === 404) {
      return await createSurvey({
        userId,
        restActivityLevel: answer.restActivityLevel!,
        residenceType: answer.residenceType!,
        houseEmptyTime: answer.houseEmptyTime!,
        furTolerance: answer.furTolerance!,
        visitorFrequency: answer.visitorFrequency!,
      });
    }

    throw err;
  }
}
