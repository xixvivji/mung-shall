import * as React from "react";
import {
  getShelterDogsWithAdoption,
  getShelterAdoptionDetail,
  getAdoptionStepsStatus,
  verifyShelterAdoption,
  getAdoptionSurvey, // 1단계
  getAdoptionEducationCert, // 2단계
  verifyShelterAdoptionStep,
  type AdoptionProcessStatus,
  type ShelterDogWithAdoptionItem,
  type ShelterAdoptionDetail,
  type AdoptionFinalStatus,
  type AdoptionEducationCertResponse,
  type AdoptionSurveyResponse,
} from "../../api/centerApplicationsApi";
import { resolveApiErrorMessage } from "../utils/errors";

// ✅ steps.tsx / components.tsx 와 동일한 타입으로 통일
export type StepDetailData =
  | { kind: "survey"; data: AdoptionSurveyResponse }
  | { kind: "educationCert"; data: AdoptionEducationCertResponse }
  | null;

export function useCenterApplications() {
  const [apps, setApps] = React.useState<ShelterDogWithAdoptionItem[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);

  const [selectedAdoptionId, setSelectedAdoptionId] = React.useState<number | null>(null);
  const [detail, setDetail] = React.useState<ShelterAdoptionDetail | null>(null);
  const [filter, setFilter] = React.useState<AdoptionProcessStatus>("IN_PROGRESS");

  const [loading, setLoading] = React.useState(false);
  const [listError, setListError] = React.useState<string | null>(null);

  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState<string | null>(null);

  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [rejectError, setRejectError] = React.useState<string | null>(null);

  // ✅ 단계(제출 데이터)
  const [selectedStepOrder, setSelectedStepOrder] = React.useState<number | null>(null);
  const [stepDetail, setStepDetail] = React.useState<StepDetailData>(null);
  const [stepDetailLoading, setStepDetailLoading] = React.useState(false);
  const [stepDetailError, setStepDetailError] = React.useState<string | null>(null);

  const refreshList = React.useCallback(async (activeFilter: AdoptionProcessStatus) => {
    setLoading(true);
    setListError(null);

    try {
      const res = await getShelterDogsWithAdoption(activeFilter);

      setApps(res.dogsWithAdoption);
      setTotalCount(res.totalCount);

      setSelectedAdoptionId((prev) => {
        if (prev && res.dogsWithAdoption.some((item) => item.adoptionId === prev)) return prev;
        return res.dogsWithAdoption[0]?.adoptionId ?? null;
      });

      return res.dogsWithAdoption;
    } catch (err) {
      setApps([]);
      setTotalCount(0);
      setSelectedAdoptionId(null);
      setListError(resolveApiErrorMessage(err, "목록을 불러오지 못했습니다."));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshList(filter);
  }, [filter, refreshList]);

  const fetchDetail = React.useCallback(async (adoptionId: number): Promise<ShelterAdoptionDetail> => {
    try {
      const shelterDetail = await getShelterAdoptionDetail(adoptionId);

      if (Array.isArray(shelterDetail.steps) && shelterDetail.steps.length > 0) {
        return shelterDetail;
      }

      try {
        const fallback = await getAdoptionStepsStatus(adoptionId);
        return { ...shelterDetail, steps: Array.isArray(fallback.steps) ? fallback.steps : [] };
      } catch {
        return shelterDetail;
      }
    } catch {
      const fallback = await getAdoptionStepsStatus(adoptionId);
      return fallback;
    }
  }, []);

  React.useEffect(() => {
    if (!selectedAdoptionId) {
      setDetail(null);
      setDetailError(null);
      return;
    }

    let active = true;
    setDetailLoading(true);
    setDetailError(null);

    fetchDetail(selectedAdoptionId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
      })
      .catch((err) => {
        if (!active) return;
        setDetail(null);
        setDetailError(resolveApiErrorMessage(err, "상세 정보를 불러오지 못했습니다."));
      })
      .finally(() => {
        if (!active) return;
        setDetailLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedAdoptionId, fetchDetail]);

  React.useEffect(() => {
    setActionError(null);
    setActionMessage(null);
  }, [selectedAdoptionId, filter]);

  // ✅ 입양 선택 바뀌면 제출데이터 초기화
  React.useEffect(() => {
    setSelectedStepOrder(null);
    setStepDetail(null);
    setStepDetailError(null);
  }, [selectedAdoptionId]);

  const selected = React.useMemo(
    () => apps.find((a) => a.adoptionId === selectedAdoptionId) ?? null,
    [apps, selectedAdoptionId]
  );

  const currentProcessStatus = detail?.processStatus ?? selected?.adoptionProcessStatus ?? filter;
  const currentFinalStatus = (detail?.status ?? null) as AdoptionFinalStatus | null;

  const canVerify =
    detail?.processStatus === "IN_PROGRESS" &&
    currentFinalStatus !== "APPROVED" &&
    currentFinalStatus !== "REJECTED";

  const actionDisabled = actionLoading || !selected || !canVerify;

  const handleApprove = async () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    const confirmed = window.confirm("해당 입양을 최종 승인 처리할까요?");
    if (!confirmed) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoption(selected.adoptionId, { isApproved: true, rejectionReason: "" });

      setActionMessage("승인 처리가 완료되었습니다.");
      await refreshList(filter);

      const next = await fetchDetail(selected.adoptionId);
      setDetail(next);
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    setRejectReason("");
    setRejectError(null);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (actionLoading) return;
    setIsRejectModalOpen(false);
    setRejectReason("");
    setRejectError(null);
  };

  const handleReject = async () => {
    if (!selected || actionLoading) return;
    if (!canVerify) return;

    const reason = rejectReason.trim();
    if (!reason) {
      setRejectError("반려 사유를 입력해주세요.");
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoption(selected.adoptionId, { isApproved: false, rejectionReason: reason });

      setActionMessage("반려 처리가 완료되었습니다.");
      setIsRejectModalOpen(false);
      setRejectReason("");

      await refreshList(filter);

      const next = await fetchDetail(selected.adoptionId);
      setDetail(next);
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const fetchStepDetail = React.useCallback(async (adoptionId: number, stepOrder: number) => {
    setStepDetailLoading(true);
    setStepDetailError(null);

    try {
      setSelectedStepOrder(stepOrder);

      if (stepOrder === 1) {
        const survey = await getAdoptionSurvey(adoptionId);
        setStepDetail({ kind: "survey", data: survey });
        return;
      }

      if (stepOrder === 2) {
        const cert = await getAdoptionEducationCert(adoptionId);
        setStepDetail({ kind: "educationCert", data: cert });
        return;
      }

      setStepDetail(null);
      setStepDetailError("현재는 1~2단계만 조회할 수 있어요.");
    } catch (err) {
      setStepDetail(null);
      setStepDetailError(resolveApiErrorMessage(err, "단계 데이터를 불러오지 못했습니다."));
    } finally {
      setStepDetailLoading(false);
    }
  }, []);

  // ✅ detail 로딩 후: "SUBMITTED(제출됨)" 단계 자동 확장 + 해당 단계 데이터 자동 조회
  React.useEffect(() => {
    if (!selected) return;
    if (!detail?.steps?.length) return;

    if (selectedStepOrder != null) return;

    const submittedIdx = detail.steps.findIndex((s) => String(s.status).toUpperCase() === "SUBMITTED");
    if (submittedIdx < 0) return;

    const order = submittedIdx + 1;

    setSelectedStepOrder(order);
    setStepDetail(null);
    setStepDetailError(null);

    if (order === 1 || order === 2) {
      fetchStepDetail(selected.adoptionId, order);
    }
  }, [detail, selected, selectedStepOrder, fetchStepDetail]);

  const toggleStep = (stepOrder: number) => {
    if (!selected) return;

    if (selectedStepOrder === stepOrder) {
      setSelectedStepOrder(null);
      setStepDetail(null);
      setStepDetailError(null);
      return;
    }

    fetchStepDetail(selected.adoptionId, stepOrder);
  };

  const handleStepApprove = async () => {
    if (!selected) return;
    if (!stepDetail) return;
    if (actionLoading) return;

    const ok = window.confirm("해당 단계를 승인할까요?");
    if (!ok) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoptionStep(stepDetail.data.stepInstanceId, { isApproved: true, rejectionReason: "" });

      setActionMessage("단계 승인 처리가 완료되었습니다.");

      const next = await fetchDetail(selected.adoptionId);
      setDetail(next);

      if (selectedStepOrder === 1 || selectedStepOrder === 2) {
        await fetchStepDetail(selected.adoptionId, selectedStepOrder);
      }
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStepRejectQuick = async () => {
    if (!selected) return;
    if (!stepDetail) return;
    if (actionLoading) return;

    const reason = window.prompt("반려 사유를 입력하세요")?.trim();
    if (!reason) return;

    setActionLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await verifyShelterAdoptionStep(stepDetail.data.stepInstanceId, { isApproved: false, rejectionReason: reason });

      setActionMessage("단계 반려 처리가 완료되었습니다.");

      const next = await fetchDetail(selected.adoptionId);
      setDetail(next);

      if (selectedStepOrder === 1 || selectedStepOrder === 2) {
        await fetchStepDetail(selected.adoptionId, selectedStepOrder);
      }
    } catch (err) {
      setActionError(resolveApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return {
    filter,
    setFilter,

    apps,
    totalCount,
    loading,
    listError,

    selectedAdoptionId,
    setSelectedAdoptionId,
    selected,

    detail,
    detailLoading,
    detailError,
    currentProcessStatus,
    currentFinalStatus,

    canVerify,
    actionLoading,
    actionError,
    actionMessage,
    actionDisabled,

    handleApprove,
    openRejectModal,

    isRejectModalOpen,
    rejectReason,
    setRejectReason: (v: string) => {
      setRejectReason(v);
      if (rejectError) setRejectError(null);
    },
    rejectError,
    handleReject,
    closeRejectModal,

    selectedStepOrder,
    stepDetail,
    stepDetailLoading,
    stepDetailError,
    toggleStep,

    handleStepApprove,
    handleStepRejectQuick,
  };
}
