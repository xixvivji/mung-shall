import { Check, CheckCircle2, Lock, X } from "lucide-react";
import { useMemo } from "react";
import type { AdoptionProcessStatus, AdoptionStep } from "@/features/manage/types";
import {
  UI_STEP_DEFS,
  computeProgress,
  type UiStep,
  type UiStepStatus,
} from "@/features/manage/utils/adoptionSteps";

type StageStatus = "completed" | "current" | "pending";

type StageId = "A" | "B" | "C";

type Stage = {
  id: StageId;
  title: string;
  status: StageStatus;
  substeps: { title: string; status: UiStepStatus; stepKey?: AdoptionStep }[];
};

/** =========================
 *  NEW FLOW (UI + REAL ORDER)
 *  A(입양 전): APPLICATION -> EDUCATION_CERT
 *  B(입양 중): CONSULT -> DOCUMENT -> CONTRACT -> APPROVAL
 *  C(입양 후): PICKUP -> CARE
 *
 *  SELECT/SURVEY 단계는 APPLICATION으로 통합.
 *  서버 단계명이 다를 수 있어 normalize 로 보정.
 *  ========================= */

const STAGE_STEPS: Record<StageId, AdoptionStep[]> = {
  A: ["APPLICATION", "EDUCATION_CERT"],
  B: ["CONSULT", "DOCUMENT", "CONTRACT", "APPROVAL"],
  C: ["PICKUP", "CARE"],
};

const STEP_TITLE: Partial<Record<AdoptionStep, string>> = {
  PROFILE: "프로필 작성",

  // SURVEY/SELECT 는 UI 에서는 APPLICATION 으로 묶어 표시
  SURVEY: "입양 설문 작성",
  SELECT: "입양 대상 선택",

  APPLICATION: "입양 설문 작성",
  EDUCATION_CERT: "입양 교육",
  CONSULT: "입양 상담",
  DOCUMENT: "개인서류 제출",
  CONTRACT: "입양 신청서 작성",
  APPROVAL: "심사 신청",

  PICKUP: "반려견 인수",
  CARE: "사후 관리",
};

function titleOf(step: AdoptionStep) {
  return STEP_TITLE[step] ?? step;
}

/** SELECT/SURVEY 는 APPLICATION 으로 통합 (UI/서버/정책 기준). */
function normalizeStep(step: AdoptionStep): AdoptionStep {
  if (step === "SELECT") return "APPLICATION";
  if (step === "SURVEY") return "APPLICATION";
  return step;
}

function stageHeaderLabel(status: StageStatus) {
  if (status === "completed") return "COMPLETED";
  if (status === "current") return "IN PROGRESS";
  return "TODO";
}

function stageStatusFromSubsteps(substeps: { status: UiStepStatus }[]): StageStatus {
  if (substeps.length === 0) return "pending";
  if (substeps.every((step) => step.status === "DONE")) return "completed";
  if (substeps.some((step) => step.status !== "TODO")) return "current";
  return "pending";
}

function uiStatusLabel(status: UiStepStatus) {
  return status;
}

function uiStatusClass(status: UiStepStatus) {
  switch (status) {
    case "DONE":
      return "bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD]";
    case "IN_PROGRESS":
      return "bg-[#BFDBFE] text-[#1D4ED8] border border-[#60A5FA]";
    case "REJECTED":
      return "bg-red-50 text-red-700 border border-red-200";
    default:
      return "bg-[#EFF4FA] text-[#475569] border border-[#CBD5E1]";
  }
}

type Props = {
  currentStep: AdoptionStep;
  selectedStep: AdoptionStep;
  onSelectStep: (step: AdoptionStep) => void;
  isEditableForStep?: (step: AdoptionStep) => boolean;
  uiSteps?: UiStep[];
  progressPct?: number;
  currentLabel?: string | null;
  processStatus?: AdoptionProcessStatus | string | null;
};

export function AdoptionTimeline({
  currentStep,
  selectedStep,
  onSelectStep,
  isEditableForStep,
  uiSteps,
  progressPct,
  currentLabel,
  processStatus,
}: Props) {
  const currentStepN = useMemo(() => normalizeStep(currentStep), [currentStep]);
  const selectedStepN = useMemo(() => normalizeStep(selectedStep), [selectedStep]);

  const baseSteps = useMemo<UiStep[]>(() => {
    if (uiSteps && uiSteps.length > 0) return uiSteps;
    const orderedKeys = UI_STEP_DEFS.map((step) => step.key);
    const currentIdx = orderedKeys.indexOf(currentStepN);

    return UI_STEP_DEFS.map((def, idx) => ({
      ...def,
      status:
        currentIdx < 0
          ? "TODO"
          : idx < currentIdx
            ? "DONE"
            : idx === currentIdx
              ? "IN_PROGRESS"
              : "TODO",
    }));
  }, [uiSteps, currentStepN]);

  const effectiveSteps = useMemo(() => {
    const prereqKeys: AdoptionStep[] = [
      "APPLICATION",
      "EDUCATION_CERT",
      "CONSULT",
      "DOCUMENT",
      "CONTRACT",
    ];
    const prereqsDone = prereqKeys.every((key) => {
      const step = baseSteps.find((item) => item.key === key);
      return step?.status === "DONE";
    });

    let approvalStatus: UiStepStatus | null = null;
    if (processStatus === "COMPLETED") {
      approvalStatus = "DONE";
    } else if (prereqsDone) {
      approvalStatus = "IN_PROGRESS";
    }

    if (!approvalStatus) return baseSteps;
    return baseSteps.map((step) =>
      step.key === "APPROVAL" ? { ...step, status: approvalStatus } : step
    );
  }, [baseSteps, processStatus]);

  const stepMap = useMemo(
    () => new Map(effectiveSteps.map((step) => [step.key, step])),
    [effectiveSteps]
  );

  const stages: Stage[] = useMemo(() => {
    const aSubsteps = STAGE_STEPS.A.map((step) => {
      const info = stepMap.get(step);
      return {
        title: info?.label ?? titleOf(step),
        stepKey: step,
        status: info?.status ?? "TODO",
      };
    });

    const bSubsteps = STAGE_STEPS.B.map((step) => {
      const info = stepMap.get(step);
      return {
        title: info?.label ?? titleOf(step),
        stepKey: step,
        status: info?.status ?? "TODO",
      };
    });

    const cSubsteps = STAGE_STEPS.C.map((step) => {
      const info = stepMap.get(step);
      return {
        title: info?.label ?? titleOf(step),
        stepKey: step,
        status: info?.status ?? "TODO",
      };
    });

    const statusA = stageStatusFromSubsteps(aSubsteps);
    const statusB = stageStatusFromSubsteps(bSubsteps);
    const statusC = stageStatusFromSubsteps(cSubsteps);

    return [
      { id: "A", title: "입양 전", status: statusA, substeps: aSubsteps },
      { id: "B", title: "입양 중", status: statusB, substeps: bSubsteps },
      { id: "C", title: "입양 후", status: statusC, substeps: cSubsteps },
    ];
  }, [stepMap]);

  const effectiveProgressPct = useMemo(() => {
    if (typeof progressPct === "number") return progressPct;
    return computeProgress(baseSteps);
  }, [progressPct, baseSteps]);

  // 상단 3단계(입양 전-중-후) 진행 바 길이
  const topBarWidthPct = useMemo(() => {
    const barMax = 66.666;
    return Math.round(((effectiveProgressPct / 100) * barMax) * 1000) / 1000;
  }, [effectiveProgressPct]);

  const currentText = useMemo(
    () => currentLabel ?? titleOf(currentStepN),
    [currentLabel, currentStepN]
  );

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[32px] font-semibold text-[#3182F6]">입양 과정</h2>
          <p className="mt-2 text-sm text-gray-500">
            현재 진행중: <span className="font-semibold text-gray-900">{currentText}</span>
          </p>
        </div>

        <div className="text-xs font-semibold text-[#3182F6]">
          진행률 {effectiveProgressPct}%
        </div>
      </div>

      {/* 상단 3단계 */}
      <div className="relative mb-12">
        <div className="absolute left-[16.666%] right-[16.666%] top-[36px] h-[2px] bg-gray-200 z-0" />
        <div
          className="absolute left-[16.666%] top-[36px] h-[2px] bg-[#3182F6] z-0"
          style={{ width: `${topBarWidthPct}%` }}
        />

        <div className="grid grid-cols-3 items-start text-center">
          {stages.map((stage) => (
            <div key={stage.id} className="relative z-10 flex flex-col items-center gap-6">
              {stage.status === "completed" && (
                <div className="w-20 h-20 rounded-full bg-[#3182F6] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              {stage.status === "current" && (
                <div className="w-20 h-20 rounded-full border-2 border-[#3182F6] bg-white flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#3182F6]" />
                </div>
              )}
              {stage.status === "pending" && (
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center" />
              )}

              <span
                className={`text-2xl font-semibold ${
                  stage.status === "current" ? "text-[#3182F6]" : "text-gray-300"
                }`}
              >
                {stage.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 단계별 리스트 */}
      <div className="grid grid-cols-3 gap-10">
        {stages.map((stage) => (
          <div key={stage.id}>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#3182F6] mb-4">
              {stageHeaderLabel(stage.status)}
            </p>

            <div className="space-y-4">
              {stage.substeps.map((substep, index) => {
                const isDone = substep.status === "DONE";
                const isRejected = substep.status === "REJECTED";

                const stepKey = substep.stepKey;
                const isSelectable = Boolean(stepKey);

                const isSelected = Boolean(stepKey && stepKey === selectedStepN);

                const editable = stepKey
                  ? isEditableForStep
                    ? isEditableForStep(stepKey)
                    : true
                  : false;

                const cardTone = isRejected
                  ? "bg-[#FEF2F2] shadow-[0_0_0_1px_rgba(248,113,113,0.40),0_8px_18px_rgba(185,28,28,0.16)]"
                  : substep.status === "IN_PROGRESS"
                    ? "bg-[#D6E8FF] shadow-[0_0_0_1px_rgba(59,130,246,0.48),0_10px_22px_rgba(37,99,235,0.22)]"
                    : isDone
                      ? "bg-[#ECF4FF] shadow-[0_0_0_1px_rgba(96,165,250,0.38),0_8px_18px_rgba(59,130,246,0.16)]"
                      : "bg-[#E9EFF7] shadow-[0_0_0_1px_rgba(100,116,139,0.32),0_6px_14px_rgba(15,23,42,0.14)]";

                const baseCard =
                  `flex items-center gap-4 rounded-md px-4 py-4 transition-[transform,background-color,box-shadow] duration-150 ${cardTone}`;

                const selectable = isSelectable ? "cursor-pointer hover:scale-[1.01] active:scale-[0.998]" : "";
                const selectedRing = isSelected
                  ? " ring-2 ring-[#2563EB]/55"
                  : "";

                const CardTag: any = isSelectable ? "button" : "div";

                return (
                  <CardTag
                    key={`${stage.id}-${index}`}
                    type={isSelectable ? "button" : undefined}
                    onClick={
                      isSelectable && stepKey ? () => onSelectStep(stepKey) : undefined
                    }
                    className={
                      baseCard +
                      selectable +
                      selectedRing +
                      (isSelectable ? " w-full text-left" : "")
                    }
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded-sm ${
                        isRejected
                          ? "bg-red-200 text-red-700"
                          : isDone
                            ? "bg-[#93C5FD] text-[#1E3A8A]"
                          : substep.status === "IN_PROGRESS"
                            ? "bg-[#60A5FA] text-white"
                            : "border border-[#64748B] bg-[#F8FAFC]"
                      }`}
                    >
                      {isDone && <Check className="h-4 w-4" />}
                      {isRejected && <X className="h-4 w-4" />}
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        isDone
                          ? "text-[#1E3A8A]"
                          : isRejected
                            ? "text-red-700"
                            : substep.status === "IN_PROGRESS"
                              ? "text-[#1E3A8A]"
                              : "text-[#334155]"
                      }`}
                    >
                      {substep.title}
                    </span>

                    <div className="ml-auto flex items-center gap-2">
                      {/* 현재 단계가 편집 불가인 경우 잠금 표시 */}
                      {stepKey && !editable && (
                        <span className="text-gray-400">
                          <Lock className="h-4 w-4" />
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${uiStatusClass(
                          substep.status
                        )}`}
                      >
                        {uiStatusLabel(substep.status)}
                      </span>
                    </div>
                  </CardTag>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
