import { useMemo, useState } from "react";
import type {
  AdoptionBeforeStep,
  AdoptionInStep,
  AdoptionAfterStep,
  AdoptionStep,
} from "@/features/mypage/types";

import { SurveyStep } from "./before/SurveyStep";
import { SelectStep } from "./before/SelectStep";

import { ApplicationStep } from "./in/1_ApplicationStep";
import { EducationCertStep } from "./in/2_EducationCertStep";
import { ConsultStep } from "./in/3_ConsultStep";
import { DocumentStep } from "./in/4_DocumentStep";
import { ContractStep } from "./in/5_ContractStep";
import { ApprovalStep } from "./in/6_ApprovalStep";

import { PickupStep } from "./after/PickupStep";
import { CareStep } from "./after/CareStep";

type Props = {
  currentStep: AdoptionStep;
  selectedStep: AdoptionStep;

  // ✅ 선택 단계만 변경(타임라인 클릭 등)
  onSelectStep?: (step: AdoptionStep) => void;

  // ✅ 진행 단계도 변경(제출 성공 시 자동 전진)
  onAdvanceStep?: (step: AdoptionStep) => void;
  onSubmitStep?: (step: AdoptionStep) => Promise<void> | void;
  adoptionId?: number;
};

type StepStatus = "completed" | "current" | "pending";

/** ====== 전체 단계 순서(전/중/후) ====== */
const BEFORE_ORDER: AdoptionBeforeStep[] = ["PROFILE", "SURVEY", "SELECT"];
const IN_ORDER: AdoptionInStep[] = [
  "APPLICATION",
  "EDUCATION_CERT",
  "CONSULT",
  "DOCUMENT",
  "CONTRACT",
  "APPROVAL",
];
const AFTER_ORDER: AdoptionAfterStep[] = ["PICKUP", "CARE"];

const FULL_ORDER: AdoptionStep[] = [...BEFORE_ORDER, ...IN_ORDER, ...AFTER_ORDER];

function isBeforeStep(step: AdoptionStep): step is AdoptionBeforeStep {
  return (BEFORE_ORDER as readonly string[]).includes(step);
}
function isInStep(step: AdoptionStep): step is AdoptionInStep {
  return (IN_ORDER as readonly string[]).includes(step);
}
function isAfterStep(step: AdoptionStep): step is AdoptionAfterStep {
  return (AFTER_ORDER as readonly string[]).includes(step);
}

function stepIndex(step: AdoptionStep) {
  return FULL_ORDER.indexOf(step);
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
  switch (step) {
    // A
    case "PROFILE":
      return "프로필 등록";
    case "SURVEY":
      return "입양 성향 설문 작성";
    case "SELECT":
      return "입양할 유기견 선택하기";

    // B
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

    // C
    case "PICKUP":
      return "반려견 인수";
    case "CARE":
      return "사후 관리";

    default:
      return step;
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
}: Props) {
  // 잠금 트리거(프론트-only): 상담완료 → 1~2 잠금, 심사시작 → 4~5 잠금
  const [consultationConfirmed, setConsultationConfirmed] = useState(false);
  const [reviewStarted, setReviewStarted] = useState(false);

  // 심사 진입 전 확인 모달 (문서/계약서 잠금 안내)
  const [isPreApprovalModalOpen, setIsPreApprovalModalOpen] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<AdoptionStep | null>(null);

  const selectedStatus = useMemo(
    () => getStepStatus(selectedStep, currentStep),
    [selectedStep, currentStep]
  );

  const isEditable = useMemo(() => {
    // B단계 잠금 규칙만 적용 (A/C는 기본 편집 가능)
    if (
      consultationConfirmed &&
      (selectedStep === "APPLICATION" || selectedStep === "EDUCATION_CERT")
    ) {
      return false;
    }
    if (reviewStarted && (selectedStep === "DOCUMENT" || selectedStep === "CONTRACT")) {
      return false;
    }
    return true;
  }, [consultationConfirmed, reviewStarted, selectedStep]);

  const lockReason = useMemo(() => {
    if (
      consultationConfirmed &&
      (selectedStep === "APPLICATION" || selectedStep === "EDUCATION_CERT")
    ) {
      return "상담이 완료되어 1~2단계는 더 이상 수정할 수 없습니다.";
    }
    if (reviewStarted && (selectedStep === "DOCUMENT" || selectedStep === "CONTRACT")) {
      return "심사가 시작되어 4~5단계는 더 이상 수정할 수 없습니다.";
    }
    return null;
  }, [consultationConfirmed, reviewStarted, selectedStep]);

  const advanceTo = async (next: AdoptionStep, completedStep?: AdoptionStep) => {
    if (completedStep && onSubmitStep) {
      await onSubmitStep(completedStep);
    }
    onSelectStep?.(next);
    onAdvanceStep?.(next);
  };

  const goNext = (next: AdoptionStep, completedStep?: AdoptionStep) => {
    // ✅ "APPROVAL"로 넘어갈 때만 확인 모달 (문서/계약서 잠금)
    if (next === "APPROVAL") {
      setPendingNextStep(next);
      setIsPreApprovalModalOpen(true);
      return;
    }
    void advanceTo(next, completedStep);
  };

  const safeGoNextFromSelected = () => {
    const next = nextOf(selectedStep);
    if (!next) {
      if (onSubmitStep) void onSubmitStep(selectedStep);
      return;
    }
    goNext(next, selectedStep);
  };

  const onConsultComplete = () => {
    setConsultationConfirmed(true);
    const next = nextOf("CONSULT");
    if (next) goNext(next, "CONSULT");
  };

  const onStartReview = () => {
    setReviewStarted(true);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl text-gray-400">해야 할 일</h2>
          <p className="mt-1 text-sm text-gray-500">
            선택 단계:{" "}
            <span className="font-semibold text-gray-800">{stepLabel(selectedStep)}</span>
            <span className="ml-2 text-xs text-gray-400">
              ({selectedStatus === "current" ? "진행중" : selectedStatus === "completed" ? "완료" : "대기"})
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

      {/* =======================
          A단계 (입양 전)
         ======================= */}
      {selectedStep === "SURVEY" && (
        <SurveyStep
          // SurveyStep이 isEditable 받는 구조면 그대로, 아니면 TS 에러 나면 제거
          // @ts-ignore
          isEditable={isEditable}
          // SurveyStep에 onSubmitSuccess가 없으면 무시됨(아래 "다음 단계로" 버튼으로 보완)
          // @ts-ignore
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "SELECT" && (
        <SelectStep
          // @ts-ignore
          isEditable={isEditable}
          // @ts-ignore
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {/* PROFILE 단계용 컴포넌트가 따로 있으면 여기 추가해라 */}
      {selectedStep === "PROFILE" && (
        <div className="rounded-2xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600">프로필 등록 단계 UI가 아직 연결되지 않았습니다.</p>
        </div>
      )}

      {/* =======================
          B단계 (입양 중)
         ======================= */}
      {selectedStep === "APPLICATION" && (
        <ApplicationStep
          adoptionId={adoptionId}
          isEditable={isEditable}
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "EDUCATION_CERT" && (
        <EducationCertStep
          adoptionId={adoptionId}
          isEditable={isEditable}
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "CONSULT" && (
        <ConsultStep isEditable={isEditable} onConsultComplete={onConsultComplete} />
      )}

      {selectedStep === "DOCUMENT" && (
        <DocumentStep
          adoptionId={adoptionId}
          isEditable={isEditable}
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "CONTRACT" && (
        <ContractStep
          adoptionId={adoptionId}
          isEditable={isEditable}
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "APPROVAL" && <ApprovalStep onStartReview={onStartReview} />}

      {/* =======================
          C단계 (입양 후)
         ======================= */}
      {selectedStep === "PICKUP" && (
        <PickupStep
          // @ts-ignore
          isEditable={isEditable}
          // @ts-ignore
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {selectedStep === "CARE" && (
        <CareStep
          // @ts-ignore
          isEditable={isEditable}
          // @ts-ignore
          onSubmitSuccess={safeGoNextFromSelected}
        />
      )}

      {/* ✅ 어떤 Step이든 "컴포넌트 내부에 제출 버튼이 없을 수 있으니" 안전장치로 NextActions에서 전진 버튼 제공 */}
      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 disabled:opacity-40"
          disabled={!prevOf(selectedStep)}
          onClick={() => {
            const prev = prevOf(selectedStep);
            if (prev) onSelectStep?.(prev);
          }}
        >
          이전 단계로
        </button>

        <button
          className="rounded-md bg-[#0064FF] hover:bg-[#0056E6] px-4 py-2 text-sm text-white disabled:opacity-40"
          disabled={!nextOf(selectedStep)}
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
                  if (pendingNextStep) void advanceTo(pendingNextStep, selectedStep);
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
