import type { AdoptionStep, AdoptionStepStatus } from "@/features/manage/types";

export type UiStepPhase = "PRE" | "DURING" | "POST";
export type UiStepStatus = "TODO" | "IN_PROGRESS" | "DONE" | "REJECTED";

export type UiStepDef = {
  key: AdoptionStep;
  label: string;
  phase: UiStepPhase;
};

export type UiStep = UiStepDef & {
  status: UiStepStatus;
  serverStatus?: string | null;
  serverStepName?: string | null;
  stepOrder?: number | null;
};

export type ServerStepLike = {
  id?: number | string | null;
  status?: string | null;
  stepStatus?: string | null;
  state?: string | null;
  stepName?: string | null;
  name?: string | null;
  stepOrder?: number | null;
  order?: number | null;
  stepDef?: {
    stepName?: string | null;
    stepOrder?: number | null;
  } | null;
};

export const UI_STEP_DEFS: UiStepDef[] = [
  { key: "APPLICATION", label: "입양 설문 작성", phase: "PRE" },
  { key: "EDUCATION_CERT", label: "입양 교육", phase: "PRE" },
  { key: "CONSULT", label: "입양 상담", phase: "DURING" },
  { key: "DOCUMENT", label: "개인서류 제출", phase: "DURING" },
  { key: "CONTRACT", label: "입양 신청서 작성", phase: "DURING" },
  { key: "APPROVAL", label: "심사 신청", phase: "DURING" },
  { key: "PICKUP", label: "반려견 인수", phase: "POST" },
  { key: "CARE", label: "사후 관리", phase: "POST" },
];

const STEP_ORDER_FALLBACK: Record<number, AdoptionStep> = {
  1: "APPLICATION",
  2: "EDUCATION_CERT",
  3: "CONSULT",
  4: "DOCUMENT",
  5: "CONTRACT",
  6: "APPROVAL",
  7: "PICKUP",
  8: "CARE",
};

const STEP_NAME_MAPPING_ENTRIES: Array<[string, AdoptionStep]> = [
  ["APPLICATION", "APPLICATION"],
  ["ADOPTION_APPLICATION", "APPLICATION"],
  ["ADOPTION_SURVEY", "APPLICATION"],
  ["SURVEY", "APPLICATION"],
  ["입양 설문 작성", "APPLICATION"],

  ["EDUCATION", "EDUCATION_CERT"],
  ["EDUCATION_CERT", "EDUCATION_CERT"],
  ["입양 교육", "EDUCATION_CERT"],

  ["CONSULT", "CONSULT"],
  ["COUNSELING", "CONSULT"],
  ["입양 상담", "CONSULT"],

  ["DOCUMENT", "DOCUMENT"],
  ["DOCUMENTS", "DOCUMENT"],
  ["개인서류 제출", "DOCUMENT"],

  ["CONTRACT", "CONTRACT"],
  ["AGREEMENT", "CONTRACT"],
  ["입양 신청서 작성", "CONTRACT"],

  ["APPROVAL", "APPROVAL"],
  ["REVIEW", "APPROVAL"],
  ["심사 신청", "APPROVAL"],

  ["PICKUP", "PICKUP"],
  ["HANDOVER", "PICKUP"],
  ["반려견 인수", "PICKUP"],

  ["CARE", "CARE"],
  ["POST_CARE", "CARE"],
  ["사후 관리", "CARE"],
];

const normalizeStepName = (value: string) =>
  value.trim().toUpperCase().replace(/[\s-]+/g, "_");

const buildStepNameLookup = () => {
  const map = new Map<string, AdoptionStep>();
  STEP_NAME_MAPPING_ENTRIES.forEach(([raw, key]) => {
    map.set(raw, key);
    map.set(normalizeStepName(raw), key);
  });
  return map;
};

const STEP_NAME_LOOKUP = buildStepNameLookup();

export const STEP_NAME_MAPPING_TABLE = STEP_NAME_MAPPING_ENTRIES;

const resolveRawStepName = (step: ServerStepLike) =>
  step.stepDef?.stepName ??
  (typeof step.stepName === "string" ? step.stepName : null) ??
  (typeof step.name === "string" ? step.name : null) ??
  null;

const resolveRawStepOrder = (step: ServerStepLike) =>
  step.stepDef?.stepOrder ??
  (typeof step.stepOrder === "number" ? step.stepOrder : null) ??
  (typeof step.order === "number" ? step.order : null) ??
  null;

const resolveRawStatus = (step: ServerStepLike) =>
  step.status ?? step.stepStatus ?? step.state ?? null;

export function resolveServerStepKey(
  stepName?: string | null,
  stepOrder?: number | null
): AdoptionStep | null {
  if (typeof stepName === "string" && stepName.trim()) {
    const trimmed = stepName.trim();
    const normalized = normalizeStepName(trimmed);
    const mapped = STEP_NAME_LOOKUP.get(normalized) ?? STEP_NAME_LOOKUP.get(trimmed) ?? null;
    if (mapped) return mapped;
  }
  if (typeof stepOrder === "number") {
    return STEP_ORDER_FALLBACK[stepOrder] ?? null;
  }
  return null;
}

export function mapServerStatusToUiStatus(status?: string | null): UiStepStatus {
  const normalized = status?.trim().toUpperCase();
  switch (normalized as AdoptionStepStatus) {
    case "NOT_STARTED":
      return "TODO";
    case "PENDING":
    case "ACTIVE":
    case "SUBMITTED":
      return "IN_PROGRESS";
    case "APPROVED":
    case "COMPLETED":
      return "DONE";
    case "REJECTED":
    case "CANCELLED":
      return "REJECTED";
    default:
      return "TODO";
  }
}

const statusRank: Record<UiStepStatus, number> = {
  REJECTED: 4,
  DONE: 3,
  IN_PROGRESS: 2,
  TODO: 1,
};

function shouldOverrideStatus(current: UiStepStatus, next: UiStepStatus) {
  return statusRank[next] > statusRank[current];
}

export function mapServerStepsToUiSteps(
  hardcodedSteps: UiStepDef[],
  serverSteps: ServerStepLike[]
): UiStep[] {
  const statusByKey = new Map<AdoptionStep, UiStep>();

  serverSteps.forEach((step, idx) => {
    const stepName = resolveRawStepName(step);
    const stepOrder = resolveRawStepOrder(step);
    let key = resolveServerStepKey(stepName, stepOrder);
    if (!key) {
      key = STEP_ORDER_FALLBACK[idx + 1] ?? null;
    }
    if (!key) return;

    const uiStatus = mapServerStatusToUiStatus(resolveRawStatus(step));
    const existing = statusByKey.get(key);

    if (!existing || shouldOverrideStatus(existing.status, uiStatus)) {
      statusByKey.set(key, {
        key,
        label: hardcodedSteps.find((item) => item.key === key)?.label ?? key,
        phase: hardcodedSteps.find((item) => item.key === key)?.phase ?? "PRE",
        status: uiStatus,
        serverStatus: resolveRawStatus(step),
        serverStepName: stepName ?? null,
        stepOrder: stepOrder ?? idx + 1,
      });
    }
  });

  return hardcodedSteps.map((def) => {
    const mapped = statusByKey.get(def.key);
    return {
      ...def,
      status: mapped?.status ?? "TODO",
      serverStatus: mapped?.serverStatus ?? null,
      serverStepName: mapped?.serverStepName ?? null,
      stepOrder: mapped?.stepOrder ?? null,
    };
  });
}

export function computeProgress(
  steps: UiStep[],
  options: { includeInProgress?: boolean } = {}
): number {
  const total = steps.length;
  if (total === 0) return 0;

  const doneCount = steps.filter((step) => step.status === "DONE").length;
  const includeInProgress = options.includeInProgress ?? true;
  const hasInProgress = steps.some((step) => step.status === "IN_PROGRESS");

  const progressCount = doneCount + (includeInProgress && hasInProgress ? 1 : 0);
  return Math.min(100, Math.max(0, Math.round((progressCount / total) * 100)));
}

export function pickCurrentStep(steps: UiStep[]): UiStep | null {
  if (steps.length === 0) return null;

  const inProgress = steps.find((step) => step.status === "IN_PROGRESS");
  if (inProgress) return inProgress;

  const rejected = steps.find((step) => step.status === "REJECTED");
  if (rejected) return rejected;

  const todo = steps.find((step) => step.status === "TODO");
  if (todo) return todo;

  return steps[steps.length - 1] ?? null;
}
