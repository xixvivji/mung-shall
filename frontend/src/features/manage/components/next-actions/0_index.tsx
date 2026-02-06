import { useMemo, useState } from "react";
import type { AdoptionProcessStatus, AdoptionStep } from "@/features/manage/types";

import { ApplicationStep } from "./before/ApplicationStep";
import { EducationCertStep } from "./before/EducationCertStep";

import { ConsultStep } from "./in/3_ConsultStep";
import { DocumentStep } from "./in/4_DocumentStep";
import { ContractStep } from "./in/5_ContractStep";
import { ApprovalStep } from "./in/6_ApprovalStep";

import { PickupStep } from "./after/PickupStep";
import { CareStep } from "./after/CareStep";

type Props = {
  currentStep: AdoptionStep;
  selectedStep: AdoptionStep;

  onSelectStep?: (step: AdoptionStep) => void;
  onAdvanceStep?: (step: AdoptionStep) => void;
  onSubmitStep?: (step: AdoptionStep) => Promise<void> | void;
  adoptionId?: number;
  processStatus?: AdoptionProcessStatus | null;
};

type StepStatus = "completed" | "current" | "pending";

const FULL_ORDER: AdoptionStep[] = [
  "PROFILE",
  "APPLICATION",
  "EDUCATION_CERT",
  "CONSULT",
  "DOCUMENT",
  "CONTRACT",
  "APPROVAL",
  "PICKUP",
  "CARE",
];

function normalizeStep(step: AdoptionStep): AdoptionStep {
  if (step === "SELECT") return "APPLICATION";
  if (step === "SURVEY") return "APPLICATION";
  return step;
}

function stepIndex(step: AdoptionStep) {
  return FULL_ORDER.indexOf(normalizeStep(step));
}

function getStepStatus(step: AdoptionStep, currentStep: AdoptionStep): StepStatus {
  const a = stepIndex(step);
  const b = stepIndex(currentStep);
  if (a < 0 || b < 0) return "pending";
  if (a < b) return "completed";
  if (a === b) return "current";
  return "pending";
}

function stepLabel(step: AdoptionStep) {
  const s = normalizeStep(step);
  switch (s) {
    case "PROFILE":
      return "프로필 등록";

    case "APPLICATION":
      return "입양 설문 작성";
    case "EDUCATION_CERT":
      return "입양 교육";

    case "CONSULT":
      return "[진행중] 3단계 · 입양 상담";
    case "DOCUMENT":
      return "[진행중] 4단계 · 입양 문서";
    case "CONTRACT":
      return "[진행중] 5단계 · 입양 계약서";
    case "APPROVAL":
      return "[진행중] 6단계 · 입양 심사";

    case "PICKUP":
      return "반려견 인수";
    case "CARE":
      return "사후 관리";

    default:
      return s;
  }
}

function nextOf(step: AdoptionStep): AdoptionStep | null {
  const idx = stepIndex(step);
  if (idx < 0) return null;
  if (idx >= FULL_ORDER.length - 1) return null;
  return FULL_ORDER[idx + 1];
}

function prevOf(step: AdoptionStep): AdoptionStep | null {
  const idx = stepIndex(step);
  if (idx <= 0) return null;
  return FULL_ORDER[idx - 1];
}

export function NextActions({
                              currentStep,
                              selectedStep,
                              onSelectStep,
                              onAdvanceStep,
                              onSubmitStep,
                              adoptionId,
                              processStatus,
                            }: Props) {
  const currentStepN = useMemo(() => normalizeStep(currentStep), [currentStep]);
  const selectedStepN = useMemo(() => normalizeStep(selectedStep), [selectedStep]);

  const [consultationConfirmed, setConsultationConfirmed] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);
  const isReviewPhase = reviewStarted || processStatus === "COMPLETED";

  const [isPreApprovalModalOpen, setIsPreApprovalModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<AdoptionStep | null>(null);

  const selectedStatus = useMemo(
      () => getStepStatus(selectedStepN, currentStepN),
      [selectedStepN, currentStepN]
  );

  const isEditableForStep = useMemo(() => {
    return (step: AdoptionStep) => {
      const s = normalizeStep(step);

      if (consultationConfirmed && (s === "APPLICATION" || s === "EDUCATION_CERT")) {
        return false;
      }

      if (isReviewPhase && (s === "DOCUMENT" || s === "CONTRACT")) {
        return false;
      }

      return true;
    };
  }, [consultationConfirmed, isReviewPhase]);

  const isEditable = useMemo(
      () => isEditableForStep(selectedStepN),
      [isEditableForStep, selectedStepN]
  );

  const lockReason = useMemo(() => {
    const s = normalizeStep(selectedStepN);

    if (consultationConfirmed && (s === "APPLICATION" || s === "EDUCATION_CERT")) {
      return "상담이 완료되어 1~2단계는 더 이상 수정할 수 없습니다.";
    }
    if (isReviewPhase && (s === "DOCUMENT" || s === "CONTRACT")) {
      return "심사가 시작되어 4~5단계는 더 이상 수정할 수 없습니다.";
    }
    return null;
  }, [consultationConfirmed, isReviewPhase, selectedStepN]);

  const advanceTo = async (next: AdoptionStep, completedStep?: AdoptionStep) => {
    if (completedStep && onSubmitStep) {
      await onSubmitStep(normalizeStep(completedStep));
    }
    onSelectStep?.(next);
    onAdvanceStep?.(next);
  };

  const goNext = (next: AdoptionStep, completedStep?: AdoptionStep) => {
    const nn = normalizeStep(next);

    if (nn === "APPROVAL") {
      setPendingNextStep(nn);
      setIsPreApprovalModalOpen(true);
      return;
    }
    void advanceTo(nn, completedStep);
  };

  const safeGoNextFromSelected = () => {
    const next = nextOf(selectedStepN);
    if (!next) {
      if (onSubmitStep) void onSubmitStep(selectedStepN);
      return;
    }
    goNext(next, selectedStepN);
  };

  const onConsultComplete = () => {
    setConsultationConfirmed(true);
    const next = nextOf("CONSULT");
    if (next) goNext(next, "CONSULT");
  };

  return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl text-gray-400">해야 할 일</h2>
            <p className="mt-1 text-sm text-gray-500">
              선택 단계:{" "}
              <span className="font-semibold text-gray-800">{stepLabel(selectedStepN)}</span>
              <span className="ml-2 text-xs text-gray-400">
              (
                {selectedStatus === "current"
                    ? "진행중"
                    : selectedStatus === "completed"
                        ? "완료"
                        : "대기"}
                )
            </span>
            </p>
          </div>

          <div className="text-sm text-gray-500">
            {isEditable ? (
                <span className="font-semibold text-[#3182F6]">편집 가능</span>
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

        {/* A단계 */}
        {selectedStepN === "PROFILE" && (
            <div className="rounded-2xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600">프로필 등록 단계 UI가 아직 연결되지 않았습니다.</p>
            </div>
        )}

        {selectedStepN === "APPLICATION" && (
            <ApplicationStep
                adoptionId={adoptionId}
                isEditable={isEditable}
                onSubmitSuccess={safeGoNextFromSelected}
            />
        )}

        {selectedStepN === "EDUCATION_CERT" && (
            <EducationCertStep
                adoptionId={adoptionId}
                isEditable={isEditable}
                onSubmitSuccess={safeGoNextFromSelected}
            />
        )}

        {/* B단계 */}
        {selectedStepN === "CONSULT" && (
            <ConsultStep
                isEditable={isEditable}
                adoptionId={adoptionId}
                onConsultComplete={onConsultComplete}
            />
        )}

        {selectedStepN === "DOCUMENT" && (
            <DocumentStep
                adoptionId={adoptionId}
                isEditable={isEditable}
                onSubmitSuccess={safeGoNextFromSelected}
            />
        )}

        {selectedStepN === "CONTRACT" && (
            <ContractStep
                adoptionId={adoptionId}
                isEditable={isEditable}
                onSubmitSuccess={safeGoNextFromSelected}
            />
        )}

        {selectedStepN === "APPROVAL" && (
            <ApprovalStep
              canReview={isReviewPhase}
              processStatus={processStatus}
              onGoPrev={() => {
                onSelectStep?.("CONTRACT");
              }}
              onGoAfterStage={() => {
                onSelectStep?.("PICKUP");
                onAdvanceStep?.("PICKUP");
              }}
            />
        )}

        {selectedStepN === "PICKUP" && (
            <PickupStep onSubmitSuccess={safeGoNextFromSelected} />
        )}

        {selectedStepN === "CARE" && adoptionId != null && <CareStep adoptionId={adoptionId} />}

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
              className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
              disabled={!prevOf(selectedStepN)}
              onClick={() => {
                const prev = prevOf(selectedStepN);
                if (prev) onSelectStep?.(prev);
              }}
          >
            이전 단계로
          </button>

          <button
              className="rounded-md bg-[#0064FF] hover:bg-[#0056E6] px-4 py-2 text-sm text-white disabled:opacity-40"
              disabled={!nextOf(selectedStepN)}
              onClick={safeGoNextFromSelected}
          >
            다음 단계로
          </button>
        </div>

        {/* 심사 진입 확인 모달 */}
        {isPreApprovalModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-lg font-semibold">심사 단계로 넘어갈까요?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  심사 단계로 넘어가면{" "}
                  <span className="font-semibold">입양 문서/계약서(4~5단계)</span>는 더 이상 수정할 수 없습니다.
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
                      className="rounded-xl bg-[#3182F6] px-4 py-2 text-sm text-white"
                      onClick={() => {
                        setIsPreApprovalModalOpen(false);
                        if (pendingNextStep) void advanceTo(pendingNextStep, selectedStepN);
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
