import { useMemo, useState } from "react";
import type { AdoptionInStep } from "@/features/mypage/types";
import { ApplicationStep } from "./1_ApplicationStep";
import { EducationCertStep } from "./2_EducationCertStep";
import { ConsultStep } from "./3_ConsultStep";
import { DocumentStep } from "./4_DocumentStep";
import { ContractStep } from "./5_ContractStep";
import { ApprovalStep } from "./6_ApprovalStep";

type Props = {
  currentStep: AdoptionInStep;
  selectedStep: AdoptionInStep;
  onSelectStep?: (step: AdoptionInStep) => void;
};

type StepStatus = "completed" | "current" | "pending";

const ORDER: AdoptionInStep[] = [
  "APPLICATION",
  "EDUCATION_CERT",
  "CONSULT",
  "DOCUMENT",
  "CONTRACT",
  "APPROVAL",
];

function stepIndex(step: AdoptionInStep) {
  return ORDER.indexOf(step);
}

function stepLabel(step: AdoptionInStep) {
  switch (step) {
    case "APPLICATION":
      return "1단계 · 입양 신청서";
    case "EDUCATION_CERT":
      return "2단계 · 입양 교육 수료증";
    case "CONSULT":
      return "3단계 · 입양 상담";
    case "DOCUMENT":
      return "4단계 · 입양 문서";
    case "CONTRACT":
      return "5단계 · 입양 계약서";
    case "APPROVAL":
      return "6단계 · 입양 심사";
    default:
      return step;
  }
}

function getStepStatus(
  step: AdoptionInStep,
  currentStep: AdoptionInStep
): StepStatus {
  const a = stepIndex(step);
  const b = stepIndex(currentStep);
  if (a < b) return "completed";
  if (a === b) return "current";
  return "pending";
}

export function NextActions({ currentStep, selectedStep, onSelectStep }: Props) {
  // 잠금 트리거(프론트-only): 상담완료 → 1~2 잠금, 심사시작 → 4~5 잠금
  const [consultationConfirmed, setConsultationConfirmed] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);

  const [isPreApprovalModalOpen, setIsPreApprovalModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] =
    useState<AdoptionInStep | null>(null);

  const selectedStatus = useMemo(
    () => getStepStatus(selectedStep, currentStep),
    [selectedStep, currentStep]
  );

  const isEditable = useMemo(() => {
    if (
      consultationConfirmed &&
      (selectedStep === "APPLICATION" || selectedStep === "EDUCATION_CERT")
    ) {
      return false;
    }

    if (
      reviewStarted &&
      (selectedStep === "DOCUMENT" || selectedStep === "CONTRACT")
    ) {
      return false;
    }

    return true;
  }, [consultationConfirmed, reviewStarted, selectedStep]);

  const goNext = (next: AdoptionInStep) => {
    if (next === "APPROVAL") {
      setPendingNextStep(next);
      setIsPreApprovalModalOpen(true);
      return;
    }
    onSelectStep?.(next);
  };

  const onConsultComplete = () => {
    setConsultationConfirmed(true);
    goNext("DOCUMENT");
  };

  const onStartReview = () => {
    setReviewStarted(true);
  };

  const lockReason = useMemo(() => {
    if (
      consultationConfirmed &&
      (selectedStep === "APPLICATION" || selectedStep === "EDUCATION_CERT")
    ) {
      return "상담이 완료되어 1~2단계는 더 이상 수정할 수 없습니다.";
    }

    if (
      reviewStarted &&
      (selectedStep === "DOCUMENT" || selectedStep === "CONTRACT")
    ) {
      return "심사가 시작되어 4~5단계는 더 이상 수정할 수 없습니다.";
    }

    return null;
  }, [consultationConfirmed, reviewStarted, selectedStep]);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl text-gray-400">해야 할 일</h2>
          <p className="mt-1 text-sm text-gray-500">
            선택 단계:{" "}
            <span className="font-semibold text-gray-800">
              {stepLabel(selectedStep)}
            </span>
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {isEditable ? (
            <span className="font-semibold text-[#5f7cf7]">편집 가능</span>
          ) : (
            <span>조회 전용</span>
          )}
        </div>
      </div>

      {!isEditable && lockReason && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {lockReason}
        </div>
      )}

      {selectedStep === "APPLICATION" && (
        <ApplicationStep
          isEditable={isEditable}
          onSubmitSuccess={() => goNext("EDUCATION_CERT")}
        />
      )}

      {selectedStep === "EDUCATION_CERT" && (
        <EducationCertStep
          isEditable={isEditable}
          onSubmitSuccess={() => goNext("CONSULT")}
        />
      )}

      {selectedStep === "CONSULT" && (
        <ConsultStep
          isEditable={isEditable}
          onConsultComplete={onConsultComplete}
        />
      )}

      {selectedStep === "DOCUMENT" && (
        <DocumentStep
          isEditable={isEditable}
          onSubmitSuccess={() => goNext("CONTRACT")}
        />
      )}

      {selectedStep === "CONTRACT" && (
        <ContractStep
          isEditable={isEditable}
          onSubmitSuccess={() => goNext("APPROVAL")}
        />
      )}

      {selectedStep === "APPROVAL" && (
        <ApprovalStep onStartReview={onStartReview} />
      )}

      {isPreApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">심사 단계로 넘어갈까요?</h3>
            <p className="mt-2 text-sm text-gray-600">
              심사 단계로 넘어가면{" "}
              <span className="font-semibold">입양 문서/계약서(4~5단계)</span>는
              더 이상 수정할 수 없습니다.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm"
                onClick={() => {
                  setIsPreApprovalModalOpen(false);
                  setPendingNextStep(null);
                }}
              >
                취소
              </button>

              <button
                className="rounded-xl bg-[#5f7cf7] px-4 py-2 text-sm text-white"
                onClick={() => {
                  setIsPreApprovalModalOpen(false);
                  if (pendingNextStep) onSelectStep?.(pendingNextStep);
                  setPendingNextStep(null);
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
