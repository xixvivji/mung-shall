import { Check, CheckCircle2, Circle, Lock } from "lucide-react";
import { useMemo } from "react";
import type {
  AdoptionBeforeStep,
  AdoptionInStep,
  AdoptionAfterStep,
  AdoptionStep,
} from "@/features/mypage/types";

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
 *  STEP DEFINITIONS
 *  ========================= */

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

const BEFORE_TITLES: { step: AdoptionBeforeStep; title: string }[] = [
  { step: "PROFILE", title: "프로필 등록" },
  { step: "SURVEY", title: "입양 성향 설문 작성" },
  { step: "SELECT", title: "입양할 유기견 선택하기" },
];

const IN_TITLES: { step: AdoptionInStep; title: string }[] = [
  { step: "APPLICATION", title: "1단계 · 입양 신청서 API" },
  { step: "EDUCATION_CERT", title: "2단계 · 입양 교육 수료증 API" },
  { step: "CONSULT", title: "3단계 · 입양 상담" },
  { step: "DOCUMENT", title: "4단계 · 입양 문서" },
  { step: "CONTRACT", title: "5단계 · 입양 계약서" },
  { step: "APPROVAL", title: "6단계 · 입양 허가" },
];

const AFTER_TITLES: { step: AdoptionAfterStep; title: string }[] = [
  { step: "PICKUP", title: "반려견 인수" },
  { step: "CARE", title: "사후 관리" },
];

const STAGE_INDEX: Record<StageId, number> = { A: 0, B: 1, C: 2 };

function isBeforeStep(step: AdoptionStep): step is AdoptionBeforeStep {
  return (BEFORE_ORDER as readonly string[]).includes(step);
}
function isInStep(step: AdoptionStep): step is AdoptionInStep {
  return (IN_ORDER as readonly string[]).includes(step);
}
function isAfterStep(step: AdoptionStep): step is AdoptionAfterStep {
  return (AFTER_ORDER as readonly string[]).includes(step);
}

function stageOf(step: AdoptionStep): StageId {
  if (isBeforeStep(step)) return "A";
  if (isInStep(step)) return "B";
  return "C";
}

function titleOf(step: AdoptionStep) {
  const b = BEFORE_TITLES.find((x) => x.step === step)?.title;
  if (b) return b;
  const i = IN_TITLES.find((x) => x.step === step)?.title;
  if (i) return i;
  const a = AFTER_TITLES.find((x) => x.step === step)?.title;
  return a ?? step;
}

function stageHeaderLabel(status: StageStatus) {
  if (status === "completed") return "COMPLETED";
  if (status === "current") return "IN PROGRESS";
  return "TODO";
}

function getStepStatusWithinOrder<T extends string>(
  step: T,
  currentStep: T,
  order: readonly T[]
): StepStatus {
  const a = order.indexOf(step);
  const b = order.indexOf(currentStep);
  if (a < 0 || b < 0) return "pending";
  if (a < b) return "completed";
  if (a === b) return "current";
  return "pending";
}

/** =========================
 *  PROPS
 *  ========================= */

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
  const currentStageId = useMemo(() => stageOf(currentStep), [currentStep]);

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

    const aSubsteps = BEFORE_TITLES.map(({ step, title }) => ({
      title,
      stepKey: step as AdoptionStep,
      status:
        statusA === "completed"
          ? "completed"
          : statusA === "pending"
            ? "pending"
            : isBeforeStep(currentStep)
              ? getStepStatusWithinOrder(step, currentStep, BEFORE_ORDER)
              : "pending",
    }));

    const bSubsteps = IN_TITLES.map(({ step, title }) => ({
      title,
      stepKey: step as AdoptionStep,
      status:
        statusB === "completed"
          ? "completed"
          : statusB === "pending"
            ? "pending"
            : isInStep(currentStep)
              ? getStepStatusWithinOrder(step, currentStep, IN_ORDER)
              : "pending",
    }));

    const cSubsteps = AFTER_TITLES.map(({ step, title }) => ({
      title,
      stepKey: step as AdoptionStep,
      status:
        statusC === "completed"
          ? "completed"
          : statusC === "pending"
            ? "pending"
            : isAfterStep(currentStep)
              ? getStepStatusWithinOrder(step, currentStep, AFTER_ORDER)
              : "pending",
    }));

    return [
      { id: "A", title: "입양 전", status: statusA, substeps: aSubsteps },
      { id: "B", title: "입양 중", status: statusB, substeps: bSubsteps },
      { id: "C", title: "입양 후", status: statusC, substeps: cSubsteps },
    ];
  }, [currentStep, currentStageId]);

  // 진행률: "현재 stage 안에서"만 계산 (A/B/C 공통)
  const progressPct = useMemo(() => {
    const sid = stageOf(currentStep);
    if (sid === "A" && isBeforeStep(currentStep)) {
      const idx = BEFORE_ORDER.indexOf(currentStep);
      return idx < 0 ? 0 : Math.round(((idx + 1) / BEFORE_ORDER.length) * 100);
    }
    if (sid === "B" && isInStep(currentStep)) {
      const idx = IN_ORDER.indexOf(currentStep);
      return idx < 0 ? 0 : Math.round(((idx + 1) / IN_ORDER.length) * 100);
    }
    if (sid === "C" && isAfterStep(currentStep)) {
      const idx = AFTER_ORDER.indexOf(currentStep);
      return idx < 0 ? 0 : Math.round(((idx + 1) / AFTER_ORDER.length) * 100);
    }
    return 0;
  }, [currentStep]);

  const currentText = useMemo(() => titleOf(currentStep), [currentStep]);

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[32px] font-semibold text-[#5f7cf7]">입양 과정</h2>
          <p className="mt-2 text-sm text-gray-500">
            현재 진행중: <span className="font-semibold text-gray-900">{currentText}</span>
          </p>
        </div>

        <div className="text-xs font-semibold text-[#5f7cf7]">진행률 {progressPct}%</div>
      </div>

      {/* 상단 3단계 */}
      <div className="relative mb-12">
        <div className="absolute left-[16.666%] right-[16.666%] top-[36px] h-[2px] bg-gray-200" />
        <div
          className="absolute left-[16.666%] top-[36px] h-[2px] bg-[#5f7cf7]"
          // 기존 로직 유지: B의 진행률처럼 보이게 하던 계산이었는데,
          // 이제 "현재 stage의 progressPct"를 그대로 반영
          style={{ width: `calc(33.333% * ${progressPct / 100})` }}
        />

        <div className="grid grid-cols-3 items-start text-center">
          {stages.map((stage) => (
            <div key={stage.id} className="flex flex-col items-center gap-6">
              {stage.status === "completed" && (
                <div className="w-20 h-20 rounded-full bg-[#5f7cf7] text-white flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              )}
              {stage.status === "current" && (
                <div className="w-20 h-20 rounded-full border-2 border-[#5f7cf7] flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-[#5f7cf7]" />
                </div>
              )}
              {stage.status === "pending" && (
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center" />
              )}
              <span
                className={`text-2xl font-semibold ${
                  stage.status === "current" ? "text-[#5f7cf7]" : "text-gray-300"
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
            <p className="text-xs font-semibold tracking-[0.2em] text-[#5f7cf7] mb-4">
              {stageHeaderLabel(stage.status)}
            </p>

            <div className="space-y-4">
              {stage.substeps.map((substep, index) => {
                const isDone = substep.status === "completed";
                const isTodo = substep.status !== "completed";

                const stepKey = substep.stepKey;

                // ✅ A/B/C 모두 선택 가능 (stepKey가 있으면)
                const isSelectable = Boolean(stepKey);

                const isSelected = Boolean(stepKey && stepKey === selectedStep);
                const isCurrent = Boolean(stepKey && stepKey === currentStep);

                const editable = stepKey
                  ? isEditableForStep
                    ? isEditableForStep(stepKey)
                    : true
                  : false;

                const baseCard =
                  `flex items-center gap-4 rounded-2xl border px-4 py-4 shadow-sm transition ` +
                  (isTodo ? "bg-[#eef2ff] border-[#c7d2fe]" : "bg-white border-gray-200");

                const selectable = isSelectable ? "cursor-pointer hover:shadow-md" : "";
                const selectedRing = isSelected ? " ring-2 ring-[#c7d2fe] border-[#5f7cf7]" : "";

                const currentBadge = isCurrent
                  ? " ml-auto rounded-full bg-[#5f7cf7] px-2 py-0.5 text-[11px] font-semibold text-white"
                  : "";

                const CardTag: any = isSelectable ? "button" : "div";

                return (
                  <CardTag
                    key={`${stage.id}-${index}`}
                    type={isSelectable ? "button" : undefined}
                    onClick={isSelectable && stepKey ? () => onSelectStep(stepKey) : undefined}
                    className={baseCard + selectable + selectedRing + (isSelectable ? " w-full text-left" : "")}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        isDone
                          ? "bg-[#c7d2fe] text-[#5f7cf7]"
                          : "border-2 border-[#5f7cf7] text-[#5f7cf7]"
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 fill-transparent" />}
                    </div>

                    <span className={`text-sm font-medium ${isDone ? "text-gray-500" : "text-gray-900"}`}>
                      {substep.title}
                    </span>

                    {isCurrent && <span className={currentBadge}>진행중</span>}

                    {isSelectable && stepKey && !isCurrent && (
                      <span className="ml-auto flex items-center gap-1 text-xs font-semibold">
                        {editable ? (
                          <span className="text-[#5f7cf7]">편집 가능</span>
                        ) : (
                          <span className="text-gray-500 inline-flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" />
                            조회 전용
                          </span>
                        )}
                      </span>
                    )}
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
