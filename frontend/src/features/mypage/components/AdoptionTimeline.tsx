import { Check, CheckCircle2, Circle, Lock } from "lucide-react";
import { useMemo } from "react";
import type { AdoptionInStep } from "@/features/mypage/types";

type StageStatus = "completed" | "current" | "pending";
type StepStatus = "completed" | "current" | "pending";

type Stage = {
  id: "A" | "B" | "C";
  title: string;
  status: StageStatus;
  substeps: { title: string; status: StepStatus; stepKey?: AdoptionInStep }[];
};

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

function getStepStatus(step: AdoptionInStep, currentStep: AdoptionInStep): StepStatus {
  const a = stepIndex(step);
  const b = stepIndex(currentStep);
  if (a < b) return "completed";
  if (a === b) return "current";
  return "pending";
}

const IN_STEP_TITLES: { step: AdoptionInStep; title: string }[] = [
  { step: "APPLICATION", title: "1단계 · 입양 신청서 API" },
  { step: "EDUCATION_CERT", title: "2단계 · 입양 교육 수료증 API" },
  { step: "CONSULT", title: "3단계 · 입양 상담" },
  { step: "DOCUMENT", title: "4단계 · 입양 문서" },
  { step: "CONTRACT", title: "5단계 · 입양 계약서" },
  { step: "APPROVAL", title: "6단계 · 입양 허가" },
];

function currentStepTitle(step: AdoptionInStep) {
  return IN_STEP_TITLES.find((x) => x.step === step)?.title ?? step;
}

function stageHeaderLabel(status: StageStatus) {
  if (status === "completed") return "COMPLETED";
  if (status === "current") return "IN PROGRESS";
  return "TODO";
}

type Props = {
  currentStep: AdoptionInStep;
  selectedStep: AdoptionInStep;
  onSelectStep: (step: AdoptionInStep) => void;
  isEditableForStep?: (step: AdoptionInStep) => boolean;
};

export function AdoptionTimeline({
  currentStep,
  selectedStep,
  onSelectStep,
  isEditableForStep,
}: Props) {
  const stages: Stage[] = useMemo(() => {
    const bSubsteps = IN_STEP_TITLES.map(({ step, title }) => ({
      title,
      status: getStepStatus(step, currentStep),
      stepKey: step,
    }));

    return [
      {
        id: "A",
        title: "입양 전",
        status: "completed",
        substeps: [
          { title: "프로필 등록", status: "completed" },
          { title: "입양 성향 설문 작성", status: "completed" },
          { title: "입양할 유기견 선택하기", status: "completed" },
        ],
      },
      {
        id: "B",
        title: "입양 중",
        status: "current",
        substeps: bSubsteps,
      },
      {
        id: "C",
        title: "입양 후",
        status: "pending",
        substeps: [
          { title: "반려견 인수", status: "pending" },
          { title: "사후 관리", status: "pending" },
        ],
      },
    ];
  }, [currentStep]);

  const bProgressPct = useMemo(() => {
    const idx = stepIndex(currentStep);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / ORDER.length) * 100);
  }, [currentStep]);

  const currentText = useMemo(() => currentStepTitle(currentStep), [currentStep]);

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-[32px] font-semibold text-[#5f7cf7]">입양 과정</h2>
          <p className="mt-2 text-sm text-gray-500">
            현재 진행중: <span className="font-semibold text-gray-900">{currentText}</span>
          </p>
        </div>

        <div className="text-xs font-semibold text-[#5f7cf7]">진행률 {bProgressPct}%</div>
      </div>

      {/* 상단 3단계 */}
      <div className="relative mb-12">
        <div className="absolute left-[16.666%] right-[16.666%] top-[36px] h-[2px] bg-gray-200" />
        <div
          className="absolute left-[16.666%] top-[36px] h-[2px] bg-[#5f7cf7]"
          style={{ width: `calc(33.333% * ${bProgressPct / 100})` }}
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

                const isBStage = stage.id === "B";
                const stepKey = isBStage ? substep.stepKey : undefined;

                const isSelected = Boolean(isBStage && stepKey && stepKey === selectedStep);
                const isCurrent = Boolean(isBStage && stepKey && stepKey === currentStep);

                const editable =
                  isBStage && stepKey ? (isEditableForStep ? isEditableForStep(stepKey) : true) : false;

                const baseCard =
                  `flex items-center gap-4 rounded-2xl border px-4 py-4 shadow-sm transition ` +
                  (isTodo ? "bg-[#eef2ff] border-[#c7d2fe]" : "bg-white border-gray-200");

                const selectable = isBStage ? "cursor-pointer hover:shadow-md" : "";
                const selectedRing = isSelected ? " ring-2 ring-[#c7d2fe] border-[#5f7cf7]" : "";

                const currentBadge = isCurrent
                  ? " ml-auto rounded-full bg-[#5f7cf7] px-2 py-0.5 text-[11px] font-semibold text-white"
                  : "";

                const CardTag: any = isBStage ? "button" : "div";

                return (
                  <CardTag
                    key={`${stage.id}-${index}`}
                    type={isBStage ? "button" : undefined}
                    onClick={isBStage && stepKey ? () => onSelectStep(stepKey) : undefined}
                    className={baseCard + selectable + selectedRing + (isBStage ? " w-full text-left" : "")}
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

                    {isBStage && stepKey && !isCurrent && (
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
