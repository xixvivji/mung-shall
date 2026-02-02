import { useCallback, useEffect, useState } from "react";
import { AdoptionTimeline, NextActions, useMyPage } from "@/features/mypage";
import type { AdoptionStep } from "@/features/mypage/types";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";

export default function ManagePage() {
  const {
    adoptionId,
    adoptionLoading,
    adoptionError,
    currentStep: apiCurrentStep,
    submitStep,
  } = useMyPage();

  const { openAlert, alertProps } = useAlertModal();

  // ✅ 진행 단계 / 선택 단계
  const [currentStep, setCurrentStep] = useState<AdoptionStep>(
    apiCurrentStep ?? "SURVEY"
  );
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(
    apiCurrentStep ?? "SURVEY"
  );

  // apiCurrentStep 변경되면 로컬 state 동기화
  useEffect(() => {
    setCurrentStep(apiCurrentStep ?? "SURVEY");
    setSelectedStep(apiCurrentStep ?? "SURVEY");
  }, [apiCurrentStep]);

  // adoptionError 처리
  useEffect(() => {
    if (adoptionError) {
      openAlert({ title: "입양 과정 오류", message: adoptionError });
    }
  }, [adoptionError, openAlert]);

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때
  const advanceTo = (next: AdoptionStep) => {
    setCurrentStep(next);
    setSelectedStep(next);
  };

  const handleSubmitStep = useCallback(
    async (step: AdoptionStep) => {
      const result = await submitStep(step);
      if (result.status === "error") {
        openAlert({ title: "단계 제출 실패", message: "잠시 후 다시 시도해주세요." });
      }
    },
    [openAlert, submitStep]
  );

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">입양 관리</h1>

      {adoptionLoading && <div className="text-sm text-[#777]">Loading...</div>}

      <AdoptionTimeline
        currentStep={currentStep}
        selectedStep={selectedStep}
        onSelectStep={setSelectedStep}
      />

      <NextActions
        currentStep={currentStep}
        selectedStep={selectedStep}
        onSelectStep={setSelectedStep}
        onAdvanceStep={advanceTo}
        onSubmitStep={handleSubmitStep}
        adoptionId={adoptionId ?? undefined}
      />

      <AlertModal {...alertProps} />
    </section>
  );
}
