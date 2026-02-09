import { useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/shared/api/client";
import {
  fetchAdoptionStepStatuses,
  normalizeAdoptionStepsStatusResponse,
} from "@/features/adoption/api/adoptionApi";
import type { AdoptionProcessStatus, AdoptionStep } from "@/features/manage/types";
import {
  UI_STEP_DEFS,
  computeProgress,
  mapServerStepsToUiSteps,
  pickCurrentStep,
  type ServerStepLike,
  type UiStep,
} from "@/features/manage/utils/adoptionSteps";

export type UseAdoptionStepsStatusResult = {
  uiSteps: UiStep[];
  serverSteps: ServerStepLike[];
  currentStep: AdoptionStep | null;
  currentLabel: string | null;
  progressPct: number;
  processStatus: AdoptionProcessStatus | null;
  loading: boolean;
  error: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeProcessStatus = (value: unknown): AdoptionProcessStatus | null => {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === "IN_PROGRESS" || normalized === "COMPLETED" || normalized === "CANCELLED") {
    return normalized as AdoptionProcessStatus;
  }
  return null;
};

const extractProcessStatus = (response: unknown): AdoptionProcessStatus | null => {
  if (!isRecord(response)) return null;

  const candidates: Record<string, unknown>[] = [];
  const pushCandidate = (value: unknown) => {
    if (!isRecord(value)) return;
    candidates.push(value);
    if (isRecord(value.adoption)) candidates.push(value.adoption);
  };

  pushCandidate(response);
  pushCandidate(response.data);
  pushCandidate(response.result);
  pushCandidate(response.content);
  pushCandidate(response.items);
  pushCandidate(response.list);

  for (const candidate of candidates) {
    const status = normalizeProcessStatus(candidate.processStatus);
    if (status) return status;
  }
  return null;
};

export default function useAdoptionStepsStatus(
  adoptionId: number | null,
  userId?: number | null
): UseAdoptionStepsStatusResult {
  const [serverSteps, setServerSteps] = useState<ServerStepLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processStatus, setProcessStatus] = useState<AdoptionProcessStatus | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const lastFetchedIdRef = useRef<number | null>(null);
  const lastRawResponseRef = useRef<unknown>(null);

  useEffect(() => {
    // DEBUG: steps/status effect dependency snapshot
    console.debug("[useAdoptionStepsStatus] effect", {
      dependencies: { adoptionId, userId },
      lastFetchedId: lastFetchedIdRef.current,
      stack: new Error().stack,
    });

    if (!adoptionId) {
      lastFetchedIdRef.current = null;
      abortRef.current?.abort();
      abortRef.current = null;
      setServerSteps([]);
      setLoading(false);
      setError(null);
      setProcessStatus(null);
      return;
    }

    if (lastFetchedIdRef.current === adoptionId) {
      // DEBUG: prevent duplicate fetch on same adoptionId
      console.debug("[useAdoptionStepsStatus] skip duplicate fetch", {
        adoptionId,
        userId,
        stack: new Error().stack,
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;
    lastFetchedIdRef.current = adoptionId;

    setLoading(true);
    setError(null);
    setProcessStatus(null);

    // DEBUG: trace steps/status API call
    console.debug("[useAdoptionStepsStatus] fetchAdoptionStepStatuses", {
      adoptionId,
      userId,
      requestId,
      stack: new Error().stack,
    });

    fetchAdoptionStepStatuses(adoptionId, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        lastRawResponseRef.current = response;
        // DEBUG: steps/status raw response
        console.debug("[useAdoptionStepsStatus] steps/status raw response", {
          adoptionId,
          response,
          stack: new Error().stack,
        });
        const rawSteps = normalizeAdoptionStepsStatusResponse(response) as ServerStepLike[];
        // DEBUG: steps/status response snapshot
        console.debug("[useAdoptionStepsStatus] steps/status response", {
          adoptionId,
          count: rawSteps.length,
          sample: rawSteps.slice(0, 3),
          stack: new Error().stack,
        });
        setServerSteps(rawSteps);
        setProcessStatus(extractProcessStatus(response));
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;

        if (err instanceof ApiError && err.status === 400) {
          // DEBUG: 400 should not trigger retries or state changes that re-run this effect.
          console.debug("[useAdoptionStepsStatus] 400 from steps/status", {
            adoptionId,
            userId,
            requestId,
            message: err.message,
            stack: new Error().stack,
          });
          setError("입양 단계 정보를 불러오지 못했습니다. (400)");
          return;
        }

        const message = err instanceof Error ? err.message : "Failed to load adoption steps.";
        setError(message);
        setProcessStatus(null);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [adoptionId]);

  const uiSteps = useMemo(() => mapServerStepsToUiSteps(UI_STEP_DEFS, serverSteps), [serverSteps]);
  const current = useMemo(() => pickCurrentStep(uiSteps), [uiSteps]);
  const progressPct = useMemo(() => computeProgress(uiSteps), [uiSteps]);

  useEffect(() => {
    if (!adoptionId) return;
    // DEBUG: steps/status mapping result snapshot
    console.debug("[useAdoptionStepsStatus] mapping result", {
      selectedAdoptionId: adoptionId,
      rawResponse: lastRawResponseRef.current,
      serverStepNames: serverSteps.map(
        (step) =>
          step.stepDef?.stepName ??
          (typeof step.stepName === "string" ? step.stepName : null) ??
          (typeof step.name === "string" ? step.name : null)
      ),
      hardcodedLabels: UI_STEP_DEFS.map((def) => def.label),
      uiSteps: uiSteps.map((step) => ({ label: step.label, uiStatus: step.status })),
      currentStepLabel: current?.label ?? null,
      progressPercent: progressPct,
      stack: new Error().stack,
    });
  }, [adoptionId, serverSteps, uiSteps, current, progressPct]);

  return {
    uiSteps,
    serverSteps,
    currentStep: current?.key ?? null,
    currentLabel: current?.label ?? null,
    progressPct,
    processStatus,
    loading,
    error,
  };
}
