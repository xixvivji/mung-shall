// src/features/matching-survey/model/options.ts
import type {
  AdoptionSurveyAnswer,
  RestActivityLevel,
  ResidenceType,
  HouseEmptyTime,
  FurTolerance,
  VisitorFrequency,
} from "./types";
import type { SurveyStep } from "./steps";

export type Option<T extends string> = {
  value: T;
  label: string;
  desc?: string;
};

export type StepConfig = {
  title: string;
  field: keyof AdoptionSurveyAnswer;
  options: Option<any>[];
};

export const STEP_CONFIG: Record<SurveyStep, StepConfig> = {
  REST_ACTIVITY: {
    title: "쉴 때 주로 무엇을 하시나요? 당신의 활동성 수준을 선택해주세요.",
    field: "restActivityLevel",
    options: [
      { value: "VERY_ACTIVE" satisfies RestActivityLevel, label: "매우 활동적", desc: "격렬한 운동, 장시간 야외 활동" },
      { value: "ACTIVE" satisfies RestActivityLevel, label: "활동적", desc: "규칙적인 운동, 활발한 야외 활동" },
      { value: "MODERATE" satisfies RestActivityLevel, label: "보통", desc: "산책, 친구 만나기, 가벼운 활동" },
      { value: "CALM" satisfies RestActivityLevel, label: "차분함", desc: "집에서 휴식, 독서, 조용한 활동" },
      { value: "VERY_CALM" satisfies RestActivityLevel, label: "매우 차분함", desc: "주로 실내 활동, 적은 움직임" },
    ],
  },

  RESIDENCE: {
    title: "현재 거주하고 계신 집의 형태를 선택해주세요.",
    field: "residenceType",
    options: [
      { value: "APARTMENT" satisfies ResidenceType, label: "아파트" },
      { value: "DETACHED_HOUSE" satisfies ResidenceType, label: "단독주택" },
      { value: "VILLA" satisfies ResidenceType, label: "빌라/연립" },
      { value: "OFFICETEL" satisfies ResidenceType, label: "오피스텔" },
      { value: "ETC" satisfies ResidenceType, label: "기타" },
    ],
  },

  EMPTY_TIME: {
    title: "평소에 하루 중 집을 비우는 시간은 어느 정도 되시나요?",
    field: "houseEmptyTime",
    options: [
      { value: "RARELY" satisfies HouseEmptyTime, label: "거의 없음", desc: "1시간 미만" },
      { value: "ONE_TO_FOUR_HOURS" satisfies HouseEmptyTime, label: "1~4시간" },
      { value: "FOUR_TO_EIGHT_HOURS" satisfies HouseEmptyTime, label: "4~8시간" },
      { value: "EIGHT_TO_TWELVE_HOURS" satisfies HouseEmptyTime, label: "8~12시간" },
      { value: "MORE_THAN_TWELVE_HOURS" satisfies HouseEmptyTime, label: "12시간 이상" },
    ],
  },

  FUR: {
    title: "반려동물의 털 빠짐에 대해 어느 정도 감수하실 수 있나요?",
    field: "furTolerance",
    options: [
      { value: "NOT_AT_ALL" satisfies FurTolerance, label: "전혀 감수 못 함" },
      { value: "LOW" satisfies FurTolerance, label: "낮음", desc: "거의 없음 수준" },
      { value: "MEDIUM" satisfies FurTolerance, label: "보통", desc: "어느 정도 감수" },
      { value: "HIGH" satisfies FurTolerance, label: "높음", desc: "상관 없음" },
    ],
  },

  VISITOR: {
    title: "가족 구성원 외에 타인이 집을 방문하는 빈도는 어느 정도 되나요?",
    field: "visitorFrequency",
    options: [
      { value: "RARELY" satisfies VisitorFrequency, label: "거의 없음" },
      { value: "OCCASIONALLY" satisfies VisitorFrequency, label: "가끔" },
      { value: "FREQUENTLY" satisfies VisitorFrequency, label: "자주" },
      { value: "VERY_FREQUENTLY" satisfies VisitorFrequency, label: "매우 자주" },
    ],
  },
};
