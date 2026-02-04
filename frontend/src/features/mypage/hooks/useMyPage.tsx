import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AdoptionDetail, AdoptionStep } from "@/features/manage/types";
import type { MyDog, PostAdoptionProcess, PostAdoptionStep } from "../types";
import { fetchMyDogs } from "../api/mypageApi";
import {
  cancelPostAdoptionProcess,
  completePostAdoptionProcess,
  fetchAdoptionDetail,
  fetchPostAdoptionProcess,
  startPostAdoptionProcess,
  submitPostAdoptionStep,
} from "@/features/postAdoption/api/postAdoptionApi";

const POST_ADOPTION_ID_KEY = "postAdoptionId";

const STEP_ORDER: AdoptionStep[] = [
  "PROFILE",
  "SURVEY",
  "SELECT",
  "APPLICATION",
  "EDUCATION_CERT",
  "CONSULT",
  "DOCUMENT",
  "CONTRACT",
  "APPROVAL",
  "PICKUP",
  "CARE",
];

function normalizeStepName(name?: string) {
  if (!name) return "";
  return name.trim().toUpperCase().replace(/\s+/g, "_");
}

function resolveStepKey(name?: string, stepOrder?: number | null): AdoptionStep | null {
  const normalized = normalizeStepName(name);
  const byName = STEP_ORDER.find((step) => step === normalized);
  if (byName) return byName;
  if (typeof stepOrder === "number") {
    const idx = stepOrder - 1;
    if (idx >= 0 && idx < STEP_ORDER.length) return STEP_ORDER[idx];
  }
  return null;
}

type UseMyPageOptions = {
  skipAdoptionDetail?: boolean;
};

export default function useMyPage(
  adoptionId?: number | null,
  options: UseMyPageOptions = {}
) {
  const safeAdoptionId =
    typeof adoptionId === "number" && Number.isFinite(adoptionId) && adoptionId > 0
      ? adoptionId
      : null;
  const skipAdoptionDetail = options.skipAdoptionDetail ?? false;
  const [dogs, setDogs] = useState<MyDog[]>([]);
  const [loading, setLoading] = useState(true);
  const [postAdoptionId, setPostAdoptionId] = useState<number | null>(() => {
    const raw = localStorage.getItem(POST_ADOPTION_ID_KEY);
    const value = raw ? Number(raw) : NaN;
    return Number.isFinite(value) && value > 0 ? value : null;
  });
  const [adoptionDetail, setAdoptionDetail] = useState<AdoptionDetail | null>(null);
  const [adoptionLoading, setAdoptionLoading] = useState(false);
  const [adoptionError, setAdoptionError] = useState<string | null>(null);
  const [postAdoption, setPostAdoption] = useState<PostAdoptionProcess | null>(null);
  const [postAdoptionLoading, setPostAdoptionLoading] = useState(false);
  const [postAdoptionError, setPostAdoptionError] = useState<string | null>(null);
  const adoptionDetailAbortRef = useRef<AbortController | null>(null);
  const adoptionDetailRequestIdRef = useRef(0);
  const adoptionIdRef = useRef<number | null>(safeAdoptionId);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      adoptionDetailAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    adoptionIdRef.current = safeAdoptionId;
  }, [safeAdoptionId]);

  useEffect(() => {
    let mounted = true;
    fetchMyDogs()
      .then((dogsData) => {
        if (mounted) {
          setDogs(dogsData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setDogs([]);
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refreshAdoptionDetail = useCallback(async (targetId?: number) => {
    const resolvedId = targetId ?? adoptionIdRef.current;
    if (!resolvedId) return;

    adoptionDetailAbortRef.current?.abort();
    const controller = new AbortController();
    adoptionDetailAbortRef.current = controller;
    const requestId = ++adoptionDetailRequestIdRef.current;

    if (isMountedRef.current) {
      setAdoptionLoading(true);
      setAdoptionError(null);
    }

    // DEBUG: adoption detail refresh trace
    console.debug("[useMyPage] Function: refreshAdoptionDetail", {
      params: { targetId, resolvedId },
      stack: new Error().stack,
    });

    try {
      // DEBUG: steps/status API call trace
      console.debug("[useMyPage] Function: fetchAdoptionDetail (API Call)", {
        params: { resolvedId },
        stack: new Error().stack,
      });
      const detail = await fetchAdoptionDetail(resolvedId, {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (requestId !== adoptionDetailRequestIdRef.current) return;
      if (isMountedRef.current) {
        setAdoptionDetail(detail);
        if (import.meta.env.DEV) {
          const snapshot = detail.steps?.map((step) => ({
            id: step.id,
            stepName: step.stepName,
            stepOrder: step.stepOrder,
            status: step.status,
          }));
          console.debug("[adoption] detail steps", { adoptionId: resolvedId, steps: snapshot });
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      if (requestId !== adoptionDetailRequestIdRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to load adoption detail.";
      if (isMountedRef.current) {
        setAdoptionError(message);
      }
    } finally {
      if (adoptionDetailAbortRef.current === controller) {
        adoptionDetailAbortRef.current = null;
      }
      if (requestId === adoptionDetailRequestIdRef.current && isMountedRef.current) {
        setAdoptionLoading(false);
      }
    }
  }, []);

  const refreshPostAdoption = useCallback(async () => {
    if (!postAdoptionId) return;
    setPostAdoptionLoading(true);
    setPostAdoptionError(null);
    try {
      const detail = await fetchPostAdoptionProcess(postAdoptionId);
      setPostAdoption(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load post-adoption detail.";
      setPostAdoptionError(message);
    } finally {
      setPostAdoptionLoading(false);
    }
  }, [postAdoptionId]);

  useEffect(() => {
    // DEBUG: adoption detail fetch effect (guards against render-triggered loops)
    console.debug("[useMyPage] useEffect [refreshAdoptionDetail] running", {
      dependencies: { safeAdoptionId, skipAdoptionDetail },
      stack: new Error().stack,
    });

    if (skipAdoptionDetail) return;
    if (!safeAdoptionId) return;
    // Only refetch when adoptionId changes to avoid render-triggered loops.
    void refreshAdoptionDetail(safeAdoptionId);
    return () => {
      adoptionDetailAbortRef.current?.abort();
      adoptionDetailAbortRef.current = null;
    };
  }, [safeAdoptionId, skipAdoptionDetail]);

  useEffect(() => {
    if (!postAdoptionId) return;
    void refreshPostAdoption();
  }, [postAdoptionId, refreshPostAdoption]);

  const startPostAdoption = useCallback(async () => {
    if (!safeAdoptionId) {
      setPostAdoptionError("Missing adoptionId.");
      return null;
    }
    setPostAdoptionLoading(true);
    setPostAdoptionError(null);
    try {
      const detail = await startPostAdoptionProcess(safeAdoptionId);
      setPostAdoption(detail);
      setPostAdoptionId(detail.id);
      localStorage.setItem(POST_ADOPTION_ID_KEY, String(detail.id));
      return detail;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start post-adoption process.";
      setPostAdoptionError(message);
      return null;
    } finally {
      setPostAdoptionLoading(false);
    }
  }, [safeAdoptionId]);

  const cancelPostAdoption = useCallback(async () => {
    if (!postAdoptionId) return;
    await cancelPostAdoptionProcess(postAdoptionId);
    setPostAdoption(null);
    setPostAdoptionId(null);
    localStorage.removeItem(POST_ADOPTION_ID_KEY);
  }, [postAdoptionId]);

  const stepSource = useMemo(() => {
    if (adoptionDetail?.steps?.length) return "adoption";
    if (postAdoption?.steps?.length) return "postAdoption";
    return "none";
  }, [adoptionDetail, postAdoption]);

  const stepsByKey = useMemo<Partial<Record<AdoptionStep, PostAdoptionStep>>>(() => {
    const sourceSteps =
      stepSource === "adoption" ? adoptionDetail?.steps : postAdoption?.steps;
    if (!sourceSteps) return {};

    const map: Partial<Record<AdoptionStep, PostAdoptionStep>> = {};
    sourceSteps.forEach((step) => {
      const key = resolveStepKey(step.stepName, step.stepOrder ?? undefined);
      if (!key || map[key]) return;
      map[key] = step as PostAdoptionStep;
    });
    return map;
  }, [adoptionDetail, postAdoption, stepSource]);

  const currentStep = useMemo<AdoptionStep>(() => {
    const ordered = STEP_ORDER.map((step) => stepsByKey[step]).filter(
      (step): step is PostAdoptionStep => Boolean(step)
    );
    if (ordered.length === 0) return "SURVEY";
    const firstIncomplete = ordered.find((step) => step.status !== "COMPLETED");
    const key = resolveStepKey(firstIncomplete?.stepName, firstIncomplete?.stepOrder ?? undefined);
    return key ?? "SURVEY";
  }, [stepsByKey]);

  const submitStep = useCallback(
    async (step: AdoptionStep) => {
      if (stepSource !== "postAdoption") return { status: "noop" as const };
      if (!postAdoptionId) return { status: "missing" as const };
      const stepInfo = stepsByKey[step];
      if (!stepInfo) return { status: "missing" as const };

      try {
        const isLast = STEP_ORDER[STEP_ORDER.length - 1] === step;
        if (isLast) {
          await completePostAdoptionProcess(postAdoptionId);
        } else {
          await submitPostAdoptionStep(postAdoptionId, stepInfo.id, step);
        }
        await refreshPostAdoption();
        return { status: "success" as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to submit step.";
        setPostAdoptionError(message);
        return { status: "error" as const, error: err };
      }
    },
    [postAdoptionId, refreshPostAdoption, stepSource, stepsByKey]
  );

  return {
    dogs,
    loading,
    adoptionId: safeAdoptionId,
    adoptionDetail,
    adoptionLoading,
    adoptionError,
    postAdoptionId,
    postAdoption,
    postAdoptionLoading,
    postAdoptionError,
    currentStep,
    stepsByKey,
    refreshAdoptionDetail,
    refreshPostAdoption,
    startPostAdoption,
    cancelPostAdoption,
    submitStep,
  };
}
