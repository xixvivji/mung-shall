// src/features/center/applications/hooks/useCenterPostAdoption.ts
import * as React from "react";
import {
  fetchCenterPostAdoptionProcessByAdoptionId,
  fetchCenterPostAdoptionStepDetail,
  type PostAdoptionProcessResponse,
  type PostAdoptionStepDetailResponse,
} from "@/features/center/api/postAdoptionApi";
import { ApiError } from "@/shared/api/client";

type State = {
  process: PostAdoptionProcessResponse | null;
  selectedStepOrder: number | null;
  detail: PostAdoptionStepDetailResponse | null;
  loading: boolean;
  error: string | null;
};

function toMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 401) return "로그인이 필요하거나 권한이 없습니다.";
    if (err.status === 404) return "사후관리 프로세스가 존재하지 않습니다.";
    if (err.status === 400) return err.message || "잘못된 요청입니다.";
    return err.message || "서버 오류가 발생했습니다.";
  }
  return "알 수 없는 오류가 발생했습니다.";
}

export function useCenterPostAdoption(adoptionId: number | null | undefined) {
  const [state, setState] = React.useState<State>({
    process: null,
    selectedStepOrder: null,
    detail: null,
    loading: false,
    error: null,
  });

  const setSelectedStepOrder = React.useCallback((stepOrder: number) => {
    setState((prev) => ({ ...prev, selectedStepOrder: stepOrder }));
  }, []);

  // 1) adoptionId -> process 조회
  React.useEffect(() => {
    if (!adoptionId) {
      setState({ process: null, selectedStepOrder: null, detail: null, loading: false, error: null });
      return;
    }

    let cancelled = false;

    (async () => {
      setState({ process: null, selectedStepOrder: null, detail: null, loading: true, error: null });

      try {
        const process = await fetchCenterPostAdoptionProcessByAdoptionId(adoptionId);
        if (cancelled) return;

        const sorted = (process.steps ?? []).slice().sort((a, b) => a.stepOrder - b.stepOrder);
        const first = sorted.length ? sorted[0].stepOrder : null;

        setState({ process, selectedStepOrder: first, detail: null, loading: false, error: null });
      } catch (e) {
        console.error("[post-adoption process] error:", e);
        if (cancelled) return;
        setState({ process: null, selectedStepOrder: null, detail: null, loading: false, error: toMessage(e) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adoptionId]);

  // 2) 선택된 step -> detail 조회
  React.useEffect(() => {
    if (!state.process || state.selectedStepOrder == null) return;

    let cancelled = false;

    (async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const detail = await fetchCenterPostAdoptionStepDetail(state.process.id, state.selectedStepOrder);
        if (cancelled) return;

        setState((prev) => ({ ...prev, detail, loading: false, error: null }));
      } catch (e) {
        if (cancelled) return;
        setState((prev) => ({ ...prev, detail: null, loading: false, error: toMessage(e) }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.process, state.selectedStepOrder]);

  const steps = React.useMemo(() => {
    const raw = state.process?.steps ?? [];
    return raw.slice().sort((a, b) => a.stepOrder - b.stepOrder);
  }, [state.process]);

  return {
    ...state,
    steps,
    setSelectedStepOrder,
  };
}
