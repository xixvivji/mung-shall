import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AdoptionTimeline, NextActions } from "@/features/manage";
import useMyPage from "@/features/mypage/hooks/useMyPage";
import type { AdoptionStatusSummary, AdoptionStep, LikedDog } from "@/features/manage/types";
import {
  cancelAdoptionProcess,
  createAdoptionProcess,
  fetchAdoptionsByStatus,
} from "@/features/manage/api/manageApi";
import { SelectStep } from "@/features/manage/components/next-actions/before/SelectStep";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import useAuth from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";
import imgFallback from "@/assets/images/7d7c0c4fb5f5ec351d4a2c2c80e08bf92b1c3de5.png";

type AdoptionSummary = {
  adoptionId: number;
  dogId: string;
  dogName?: string;
  dogImageUrl?: string;
  createdAt?: string;
};

const ADOPTION_SUMMARY_KEY = "adoptionProcessSummaries";

const normalizeImageUrl = (url?: string) => {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
};

const readSummaries = (): AdoptionSummary[] => {
  try {
    const raw = localStorage.getItem(ADOPTION_SUMMARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const adoptionId = Number(record.adoptionId ?? record.id ?? record.adoption_id);
        const dogId = typeof record.dogId === "string" ? record.dogId : String(record.dogId ?? "");
        if (!Number.isFinite(adoptionId) || !dogId) return null;
        const rawImage =
          typeof record.dogImageUrl === "string"
            ? record.dogImageUrl
            : typeof record.imageUrl === "string"
              ? record.imageUrl
              : undefined;
        return {
          adoptionId,
          dogId,
          dogName: typeof record.dogName === "string" ? record.dogName : undefined,
          dogImageUrl: rawImage ? normalizeImageUrl(rawImage) : undefined,
          createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
        } satisfies AdoptionSummary;
      })
      .filter((item): item is AdoptionSummary => Boolean(item));
  } catch {
    return [];
  }
};

const writeSummaries = (items: AdoptionSummary[]) => {
  localStorage.setItem(ADOPTION_SUMMARY_KEY, JSON.stringify(items));
};

const parseAdoptionId = (value?: string | null): number | null => {
  if (!value) return null;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
};

const toAdoptionSummary = (item: AdoptionStatusSummary): AdoptionSummary => {
  const normalizedImage = normalizeImageUrl(item.imageUrl);
  return {
    adoptionId: item.adoptionId,
    dogId: item.dogId ? String(item.dogId) : "",
    dogName: item.kindNm && item.kindNm.trim() ? item.kindNm : undefined,
    dogImageUrl: normalizedImage || undefined,
  };
};

const mergeSummaries = (
  serverSummaries: AdoptionSummary[],
  previous: AdoptionSummary[]
) => {
  const prevById = new Map(previous.map((item) => [item.adoptionId, item]));
  return serverSummaries.map((item) => {
    const prev = prevById.get(item.adoptionId);
    return {
      ...item,
      dogId: item.dogId || prev?.dogId || "",
      dogName: item.dogName ?? prev?.dogName,
      dogImageUrl: item.dogImageUrl ?? prev?.dogImageUrl,
      createdAt: item.createdAt ?? prev?.createdAt,
    };
  });
};

const pickLatestAdoption = (items: AdoptionStatusSummary[]) => {
  if (items.length === 0) return null;
  return items.reduce((latest, current) => {
    if (!latest) return current;
    if (
      typeof current.adoptionId === "number" &&
      typeof latest.adoptionId === "number"
    ) {
      return current.adoptionId > latest.adoptionId ? current : latest;
    }
    return latest;
  }, null as AdoptionStatusSummary | null);
};

/**
 * 입양자(Adopter) 전용 입양 관리 페이지 컴포넌트.
 * 진행 중인 입양이 있으면 카드로 선택하고 과정을 관리합니다.
 */
function AdopterManagePage() {
  const { adoptionId: adoptionIdFromPath } = useParams<{ adoptionId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAlert, alertProps } = useAlertModal();

  const numericId = useMemo(() => {
    const queryId = parseAdoptionId(searchParams.get("adoptionId"));
    if (queryId) return queryId;
    return parseAdoptionId(adoptionIdFromPath);
  }, [adoptionIdFromPath, searchParams]);

  const [summaries, setSummaries] = useState<AdoptionSummary[]>(() => readSummaries());
  const [selectedAdoptionId, setSelectedAdoptionId] = useState<number | null>(
    () => numericId ?? null
  );
  const [isSelecting, setIsSelecting] = useState(() => summaries.length === 0);
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [isLoadingInProgress, setIsLoadingInProgress] = useState(false);

  useEffect(() => {
    if (numericId) setSelectedAdoptionId(numericId);
  }, [numericId]);

  useEffect(() => {
    writeSummaries(summaries);
  }, [summaries]);

  useEffect(() => {
    if (!user?.userId) return;
    let mounted = true;
    setIsLoadingInProgress(true);
    fetchAdoptionsByStatus(user.userId, "IN_PROGRESS")
      .then((items) => {
        if (!mounted) return;
        const serverSummaries = items.map(toAdoptionSummary);
        setSummaries((prev) => mergeSummaries(serverSummaries, prev));
      })
      .catch(() => {
        if (!mounted) return;
      })
      .finally(() => {
        if (mounted) setIsLoadingInProgress(false);
      });
    return () => {
      mounted = false;
    };
  }, [numericId, user?.userId]);

  useEffect(() => {
    if (!selectedAdoptionId) return;
    if (isLoadingInProgress) return;
    const exists = summaries.some((item) => item.adoptionId === selectedAdoptionId);
    if (!exists) setSelectedAdoptionId(null);
  }, [selectedAdoptionId, summaries, isLoadingInProgress]);

  const {
    adoptionLoading,
    adoptionError,
    currentStep: apiCurrentStep,
    submitStep,
  } = useMyPage(selectedAdoptionId);

  // ✅ 진행 단계 / 선택 단계
  const [currentStep, setCurrentStep] = useState<AdoptionStep>(
    apiCurrentStep ?? "SURVEY"
  );
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(
    apiCurrentStep ?? "SURVEY"
  );

  // apiCurrentStep 변경되면 로컬 state 동기화
  useEffect(() => {
    setCurrentStep(apiCurrentStep ?? "SURVEY");
    setSelectedStep(apiCurrentStep ?? "SURVEY");
  }, [apiCurrentStep, selectedAdoptionId]);

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때
  const advanceTo = (next: AdoptionStep) => {
    setCurrentStep(next);
    setSelectedStep(next);
  };

  const handleSubmitStep = useCallback(
    async (step: AdoptionStep) => {
      const result = await submitStep(step);
      if (result.status === "error") {
        openAlert({ title: "단계 제출 실패", message: "잠시 후 다시 시도해주세요." });
      }
    },
    [openAlert, submitStep]
  );

  const handleAdopt = useCallback(
    async (dog: LikedDog) => {
      if (!user?.userId) {
        openAlert({ title: "로그인이 필요합니다.", message: "로그인 후 다시 시도해주세요." });
        throw new Error("로그인이 필요합니다.");
      }
      const dogId = Number(dog.id);
      if (!Number.isFinite(dogId)) {
        throw new Error("잘못된 강아지 ID입니다.");
      }
      const existing = await fetchAdoptionsByStatus(user.userId, "IN_PROGRESS");
      if (existing.length > 0) {
        const currentAdoption = pickLatestAdoption(existing) ?? existing[0];
        if (!currentAdoption?.adoptionId) {
          throw new Error("진행 중인 입양 정보를 찾지 못했습니다.");
        }
        setSummaries((prev) => mergeSummaries(existing.map(toAdoptionSummary), prev));
        setSelectedAdoptionId(currentAdoption.adoptionId);
        navigate(`/manage?adoptionId=${currentAdoption.adoptionId}`);
        openAlert({
          title: "진행 중인 입양",
          message: "이미 진행 중인 입양이 있어 관리 페이지로 이동합니다.",
        });
        return;
      }
      const adoptionId = await createAdoptionProcess({
        userId: user.userId,
        abandonedDogId: dogId,
      });
      setSummaries((prev) => {
        const exists = prev.some((item) => item.adoptionId === adoptionId);
        if (exists) return prev;
        const normalizedImage = normalizeImageUrl(dog.imageUrl);
        return [
          {
            adoptionId,
            dogId: String(dogId),
            dogName: dog.name,
            dogImageUrl: normalizedImage || undefined,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ];
      });
      setSelectedAdoptionId(adoptionId);
      navigate(`/manage?adoptionId=${adoptionId}`);
    },
    [navigate, openAlert, user]
  );

  const handleCancelAdoption = useCallback(
    async (adoptionId: number) => {
      if (!adoptionId || cancellingIds.has(adoptionId)) return;
      setCancellingIds((prev) => new Set(prev).add(adoptionId));
      try {
        await cancelAdoptionProcess(adoptionId);
        setSummaries((prev) => prev.filter((item) => item.adoptionId !== adoptionId));
        setSelectedAdoptionId((prev) => (prev === adoptionId ? null : prev));
        openAlert({ title: "입양 취소", message: "입양 절차를 취소했어요." });
      } catch (err) {
        const message = err instanceof Error ? err.message : "입양 취소에 실패했습니다.";
        openAlert({ title: "입양 취소 실패", message });
      } finally {
        setCancellingIds((prev) => {
          const next = new Set(prev);
          next.delete(adoptionId);
          return next;
        });
      }
    },
    [cancellingIds, openAlert]
  );

  const hasOngoing = summaries.length > 0;
  const selectedOngoing = useMemo(
    () => summaries.find((item) => item.adoptionId === selectedAdoptionId) ?? null,
    [summaries, selectedAdoptionId]
  );
  const shouldShowTimeline = hasOngoing && Boolean(selectedOngoing);

  const displaySummaries = useMemo(() => summaries, [summaries]);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">입양 관리</h1>

      {adoptionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {adoptionError}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">진행 중인 입양</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displaySummaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              진행 중인 입양 절차가 없습니다.
            </div>
          ) : (
            displaySummaries.map((summary) => {
              const isSelected = summary.adoptionId === selectedAdoptionId;
              const isCancelling = cancellingIds.has(summary.adoptionId);
              return (
                <div
                  key={summary.adoptionId}
                  className={[
                    "relative rounded-2xl border bg-white p-4 shadow-sm transition",
                    isSelected
                      ? "border-[#3182F6] ring-2 ring-[#c7d2fe]"
                      : "border-gray-200 hover:border-[#dbe5ff]",
                  ].join(" ")}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleCancelAdoption(summary.adoptionId);
                    }}
                    disabled={isCancelling}
                    className="absolute right-3 top-3 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isCancelling ? "취소 중" : "X"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedAdoptionId(summary.adoptionId)}
                    className="flex w-full items-center gap-4 text-left"
                  >
                    {summary.dogImageUrl ? (
                      <img
                        src={normalizeImageUrl(summary.dogImageUrl)}
                        alt={summary.dogName ?? "입양 예정 강아지"}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = imgFallback;
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-[11px] text-gray-400"
                        aria-label="이미지 없음"
                      >
                        이미지 없음
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {summary.dogName ?? "입양 진행 중"}
                      </div>
                      <div className="text-xs text-gray-500">입양 ID: {summary.adoptionId}</div>
                      {summary.createdAt ? (
                        <div className="text-xs text-gray-400">
                          시작: {summary.createdAt.slice(0, 10)}
                        </div>
                      ) : null}
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-[#3182F6] px-2 py-1 text-[11px] font-semibold text-white">
                        선택됨
                      </span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {adoptionLoading && (
        <div className="text-sm text-gray-500">입양 정보를 불러오는 중...</div>
      )}

      {shouldShowTimeline ? (
        <>
          <AdoptionTimeline
            currentStep={currentStep}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
          />

          <NextActions
            currentStep={currentStep}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onAdvanceStep={advanceTo}
            onSubmitStep={handleSubmitStep}
            adoptionId={selectedAdoptionId ?? undefined}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            입양 프로세스를 선택해주세요.
          </h3>
          <div className="mt-3">
            <Button asChild className="rounded-lg">
              <Link to={ROUTES.adoption}>유기견 보러가기</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">새 입양 시작</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="rounded-lg"
            onClick={() => setIsSelecting((prev) => !prev)}
          >
            {isSelecting ? "선택 닫기" : "새 입양 시작"}
          </Button>
          <span className="text-sm text-gray-500">
            좋아요한 강아지에서 계속 입양을 시작할 수 있어요.
          </span>
        </div>

        {isSelecting && (
          <SelectStep
            onAdopt={handleAdopt}
            onSubmitSuccess={() => {
              openAlert({ title: "입양 시작", message: "입양 절차를 시작했어요." });
              setIsSelecting(false);
            }}
          />
        )}
      </div>

      <AlertModal {...alertProps} />
    </section>
  );
}

/**
 * `/manage` 경로에 대한 라우팅을 처리하는 페이지 컴포넌트.
 * 사용자 유형을 확인하여 입양자인 경우에만 `AdopterManagePage`를 렌더링하고,
 * 보호소/보호센터 사용자인 경우 `/center` 페이지로 리디렉션합니다.
 */
export default function ManagePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userType = user?.userType?.toLowerCase();

  useEffect(() => {
    // 로그인한 사용자가 보호소/센터 유형이면 /center로 리디렉션
    if (user && (userType === "shelter" || userType === "center")) {
      navigate(ROUTES.center, { replace: true });
    }
  }, [user, userType, navigate]);

  // 사용자 유형이 아직 확인되지 않았거나, 리디렉션 중일 때 로딩 표시
  if (!user || userType === "shelter" || userType === "center") {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <AdopterManagePage />;
}
