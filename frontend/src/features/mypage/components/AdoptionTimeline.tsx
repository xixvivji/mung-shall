import { Check, CheckCircle2, Lock } from "lucide-react";
import { useMemo } from "react";
import type { AdoptionStep } from "@/features/mypage/types";

type StageStatus = "completed" | "current" | "pending";
type StepStatus = "completed" | "current" | "pending";

type StageId = "A" | "B" | "C";

type Stage = {
  id: StageId;
  title: string;
  status: StageStatus;
  substeps: { title: string; status: StepStatus; stepKey?: AdoptionStep }[];
};

/** =========================
 *  NEW FLOW (UI + REAL ORDER)
 *  A(입양 전): APPLICATION -> EDUCATION_CERT -> SELECT
 *  B(입양 중): CONSULT -> DOCUMENT -> CONTRACT -> APPROVAL
 *  C(입양 후): PICKUP -> CARE
 *
 *  SURVEY는 플로우/타임라인에서 제거.
 *  다만 서버에서 SURVEY가 들어올 수 있으니 normalize로 방어.
 *  ========================= */

const STAGE_INDEX: Record<StageId, number> = { A: 0, B: 1, C: 2 };

const STAGE_STEPS: Record<StageId, AdoptionStep[]> = {
  A: ["APPLICATION", "EDUCATION_CERT", "SELECT"],
  B: ["CONSULT", "DOCUMENT", "CONTRACT", "APPROVAL"],
  C: ["PICKUP", "CARE"],
};

const STEP_TITLE: Partial<Record<AdoptionStep, string>> = {
  PROFILE: "프로필 등록",

  // SURVEY: 타임라인에서는 숨기지만, 혹시 current로 들어오면 텍스트 표시용
  SURVEY: "성향 설문 작성",

  SELECT: "유기견 선택",

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

/** ✅ SURVEY가 들어오면 APPLICATION로 치환 (UI/진행률/상단바 계산 안정화) */
function normalizeStep(step: AdoptionStep): AdoptionStep {
  if (step === "SURVEY") return "APPLICATION";
  return step;
}

function stageOf(step: AdoptionStep): StageId {
  const s = normalizeStep(step);
  if (STAGE_STEPS.A.includes(s)) return "A";
  if (STAGE_STEPS.B.includes(s)) return "B";
  if (STAGE_STEPS.C.includes(s)) return "C";
  return "A";
}

function stageHeaderLabel(status: StageStatus) {
  if (status === "completed") return "COMPLETED";
  if (status === "current") return "IN PROGRESS";
  return "TODO";
}

function getStepStatusInStage(
  step: AdoptionStep,
  currentStep: AdoptionStep,
  stageSteps: AdoptionStep[]
): StepStatus {
  const a = stageSteps.indexOf(step);
  const b = stageSteps.indexOf(currentStep);
  if (a < 0 || b < 0) return "pending";
  if (a < b) return "completed";
  if (a === b) return "current";
  return "pending";
}

type Props = {
  currentStep: AdoptionStep;
  selectedStep: AdoptionStep;
  onSelectStep: (step: AdoptionStep) => void;
  isEditableForStep?: (step: AdoptionStep) => boolean;
};

export function AdoptionTimeline({
  currentStep,
  selectedStep,
  onSelectStep,
  isEditableForStep,
}: Props) {
  const currentStepN = useMemo(() => normalizeStep(currentStep), [currentStep]);
  const selectedStepN = useMemo(() => normalizeStep(selectedStep), [selectedStep]);

  const currentStageId = useMemo(() => stageOf(currentStepN), [currentStepN]);

  const stages: Stage[] = useMemo(() => {
    const makeStageStatus = (id: StageId): StageStatus => {
      const cur = STAGE_INDEX[currentStageId];
      const me = STAGE_INDEX[id];
      if (me < cur) return "completed";
      if (me === cur) return "current";
      return "pending";
    };

    const statusA = makeStageStatus("A");
    const statusB = makeStageStatus("B");
    const statusC = makeStageStatus("C");

    const aSubsteps = STAGE_STEPS.A.map((step) => ({
      title: titleOf(step),
      stepKey: step,
      status:
        statusA === "completed"
          ? "completed"
          : statusA === "pending"
            ? "pending"
            : currentStageId === "A"
              ? getStepStatusInStage(step, currentStepN, STAGE_STEPS.A)
              : "pending",
    }));

    const bSubsteps = STAGE_STEPS.B.map((step) => ({
      title: titleOf(step),
      stepKey: step,
      status:
        statusB === "completed"
          ? "completed"
          : statusB === "pending"
            ? "pending"
            : currentStageId === "B"
              ? getStepStatusInStage(step, currentStepN, STAGE_STEPS.B)
              : "pending",
    }));

    const cSubsteps = STAGE_STEPS.C.map((step) => ({
      title: titleOf(step),
      stepKey: step,
      status:
        statusC === "completed"
          ? "completed"
          : statusC === "pending"
            ? "pending"
            : currentStageId === "C"
              ? getStepStatusInStage(step, currentStepN, STAGE_STEPS.C)
              : "pending",
    }));

    return [
      { id: "A", title: "입양 전", status: statusA, substeps: aSubsteps },
      { id: "B", title: "입양 중", status: statusB, substeps: bSubsteps },
      { id: "C", title: "입양 후", status: statusC, substeps: cSubsteps },
    ];
  }, [currentStageId, currentStepN]);

  // ✅ 진행률: "현재 stage 안에서"만 계산
  const progressPct = useMemo(() => {
    const sid = stageOf(currentStepN);
    const arr = STAGE_STEPS[sid];
    const idx = arr.indexOf(currentStepN);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / arr.length) * 100);
  }, [currentStepN]);

  // ✅ 상단 3단계(원-막대) 진행 너비 계산
  const topBarWidthPct = useMemo(() => {
    const seg = 33.333;
    const sid = stageOf(currentStepN);

    if (sid === "A") return seg * (progressPct / 100);
    if (sid === "B") return seg + seg * (progressPct / 100);
    return seg * 2;
  }, [currentStepN, progressPct]);

  const currentText = useMemo(() => titleOf(currentStepN), [currentStepN]);

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[32px] font-semibold text-[#3182F6]">입양 과정</h2>
          <p className="mt-2 text-sm text-gray-500">
            현재 진행중: <span className="font-semibold text-gray-900">{currentText}</span>
          </p>
        </div>

        <div className="text-xs font-semibold text-[#3182F6]">진행률 {progressPct}%</div>
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

      {/* 하단 체크리스트 */}
      <div className="grid grid-cols-3 gap-10">
        {stages.map((stage) => (
          <div key={stage.id}>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#3182F6] mb-4">
              {stageHeaderLabel(stage.status)}
            </p>

            <div className="space-y-4">
              {stage.substeps.map((substep, index) => {
                const isDone = substep.status === "completed";
                const isTodo = substep.status !== "completed";

                const stepKey = substep.stepKey;
                const isSelectable = Boolean(stepKey);

                const isSelected = Boolean(stepKey && stepKey === selectedStepN);
                const isCurrent = Boolean(stepKey && stepKey === currentStepN);

                const editable = stepKey
                  ? isEditableForStep
                    ? isEditableForStep(stepKey)
                    : true
                  : false;

                const baseCard =
                  `flex items-center gap-4 rounded-md border px-4 py-4 shadow-sm transition ` +
                  (isTodo ? "bg-[#eef2ff] border-[#c7d2fe]" : "bg-white border-gray-200");

                const selectable = isSelectable ? "cursor-pointer hover:shadow-md" : "";
                const selectedRing = isSelected
                  ? " ring-2 ring-[#c7d2fe] border-[#3182F6]"
                  : "";

                const currentBadge = isCurrent
                  ? " ml-auto rounded-full bg-[#3182F6] px-2 py-0.5 text-[11px] font-semibold text-white"
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
                        isDone
                          ? "bg-[#c7d2fe] text-[#3182F6]"
                          : "border-2 border-[#3182F6] bg-white"
                      }`}
                    >
                      {isDone && <Check className="h-4 w-4" />}
                    </div>

                    <span className={`text-sm font-medium ${isDone ? "text-gray-500" : "text-gray-900"}`}>
                      {substep.title}
                    </span>

                    {/* ✅ 편집 불가면 락 아이콘 (선택적으로 표시) */}
                    {stepKey && !editable && (
                      <span className="ml-auto text-gray-400">
                        <Lock className="h-4 w-4" />
                      </span>
                    )}

                    {isCurrent && <span className={currentBadge}>진행중</span>}
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
