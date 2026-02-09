import { useEffect, useState } from "react";
import type { AdoptionSurveyAnswer } from "../model/types";
import { SURVEY_STEP_ORDER } from "../model/steps";
import { STEP_CONFIG } from "../model/options";

export function useMatchingSurvey(initial?: AdoptionSurveyAnswer) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answer, setAnswer] = useState<AdoptionSurveyAnswer>(initial ?? {});

  // ✅ initial이 나중에 들어오면 answer를 반영
  useEffect(() => {
    if (!initial) return;
    setAnswer(initial);
    setStepIndex(0);
  }, [initial]);

  const step = SURVEY_STEP_ORDER[stepIndex];
  const config = STEP_CONFIG[step];
  const selected = answer[config.field];

  const progress = Math.round(((stepIndex + 1) / SURVEY_STEP_ORDER.length) * 100);

  function setField<K extends keyof AdoptionSurveyAnswer>(key: K, value: AdoptionSurveyAnswer[K]) {
    setAnswer((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (!selected) return;
    if (stepIndex < SURVEY_STEP_ORDER.length - 1) setStepIndex((i) => i + 1);
  }

  function prev() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  return {
    step,
    stepIndex,
    total: SURVEY_STEP_ORDER.length,
    progress,
    config,
    answer,
    selected,
    setField,
    next,
    prev,
    isLast: stepIndex === SURVEY_STEP_ORDER.length - 1,
    canNext: !!selected,
    canPrev: stepIndex > 0,
  };
}
