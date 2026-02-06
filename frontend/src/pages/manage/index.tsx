import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AdoptionTimeline, NextActions } from "@/features/manage";
import useMyPage from "@/features/mypage/hooks/useMyPage";
import useAdoptionStepsStatus from "@/features/manage/hooks/useAdoptionStepsStatus";
import type { AdoptionStatusSummary, AdoptionStep, LikedDog } from "@/features/manage/types";
import {
  cancelAdoptionProcess,
  fetchAdoptionsByStatus,
} from "@/features/manage/api/manageApi";
import { startAdoption } from "@/features/adoption/api/adoptionApi";
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
const MANAGE_SELECTED_DOG_KEY = "manage:selectedDogId";

const normalizeImageUrl = (url?: string) => {
  if (!url) return "";
  return url.replace(/^http:\/\//i, "https://");
};

const parsePositiveNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const num = Number(trimmed);
    return Number.isFinite(num) && num > 0 ? num : null;
  }
  return null;
};

const dedupeSummaries = (items: AdoptionSummary[]) => {
  const byId = new Map<number, AdoptionSummary>();
  items.forEach((item) => {
    const adoptionId = parsePositiveNumber(item.adoptionId);
    if (!adoptionId) return;
    const normalized: AdoptionSummary = {
      ...item,
      adoptionId,
      dogId: typeof item.dogId === "string" ? item.dogId : String(item.dogId ?? ""),
    };
    const prev = byId.get(adoptionId);
    if (!prev) {
      byId.set(adoptionId, normalized);
      return;
    }
    byId.set(adoptionId, {
      adoptionId,
      dogId: normalized.dogId || prev.dogId,
      dogName: normalized.dogName ?? prev.dogName,
      dogImageUrl: normalized.dogImageUrl ?? prev.dogImageUrl,
      createdAt: normalized.createdAt ?? prev.createdAt,
    });
  });
  return Array.from(byId.values());
};

const readSummaries = (): AdoptionSummary[] => {
  try {
    const raw = localStorage.getItem(ADOPTION_SUMMARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items = parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const adoptionId = parsePositiveNumber(
          record.adoptionId ?? record.id ?? record.adoption_id
        );
        const dogId = typeof record.dogId === "string" ? record.dogId : String(record.dogId ?? "");
        if (!adoptionId || !dogId) return null;
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
    return dedupeSummaries(items);
  } catch {
    return [];
  }
};

const writeSummaries = (items: AdoptionSummary[]) => {
  localStorage.setItem(ADOPTION_SUMMARY_KEY, JSON.stringify(dedupeSummaries(items)));
};

const parseAdoptionId = (value?: string | null): number | null =>
  parsePositiveNumber(value);

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
  const merged = serverSummaries.map((item) => {
    const prev = prevById.get(item.adoptionId);
    return {
      ...item,
      dogId: item.dogId || prev?.dogId || "",
      dogName: item.dogName ?? prev?.dogName,
      dogImageUrl: item.dogImageUrl ?? prev?.dogImageUrl,
      createdAt: item.createdAt ?? prev?.createdAt,
    };
  });
  return dedupeSummaries(merged);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const { openAlert, alertProps } = useAlertModal();

  const queryAdoptionId = useMemo(
    () => parseAdoptionId(searchParams.get("adoptionId")),
    [searchParams]
  );
  const queryDogId = useMemo(
    () => parsePositiveNumber(searchParams.get("dogId")),
    [searchParams]
  );
  const stateDogId = useMemo(() => {
    const state = location.state as { selectedDogId?: unknown } | null;
    return parsePositiveNumber(state?.selectedDogId);
  }, [location.state]);
  const numericId = useMemo(() => {
    if (queryAdoptionId) return queryAdoptionId;
    return parseAdoptionId(adoptionIdFromPath);
  }, [adoptionIdFromPath, queryAdoptionId]);

  const fromFavorite = searchParams.get("from") === "favorite";
  const [preferredDogId, setPreferredDogId] = useState<number | null>(() => {
    return (
      queryDogId ??
      stateDogId ??
      parsePositiveNumber(sessionStorage.getItem(MANAGE_SELECTED_DOG_KEY))
    );
  });
  const [summaries, setSummaries] = useState<AdoptionSummary[]>(() => readSummaries());
  const [selectedAdoptionId, setSelectedAdoptionId] = useState<number | null>(
    () => numericId ?? null
  );
  const [isSelecting, setIsSelecting] = useState(
    () => summaries.length === 0 || fromFavorite
  );
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [isLoadingInProgress, setIsLoadingInProgress] = useState(false);

  useEffect(() => {
    if (numericId) {
      setSelectedAdoptionId(numericId);
      return;
    }
    setSelectedAdoptionId(null);
  }, [numericId]);

  useEffect(() => {
    const nextDogId =
      queryDogId ??
      stateDogId ??
      parsePositiveNumber(sessionStorage.getItem(MANAGE_SELECTED_DOG_KEY));
    if (nextDogId !== preferredDogId) {
      setPreferredDogId(nextDogId);
    }
    if (nextDogId) {
      sessionStorage.setItem(MANAGE_SELECTED_DOG_KEY, String(nextDogId));
    }
  }, [preferredDogId, queryDogId, stateDogId]);

  useEffect(() => {
    if (!fromFavorite) return;
    setIsSelecting(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("from");
        return next;
      },
      { replace: true }
    );
  }, [fromFavorite, setSearchParams]);

  useEffect(() => {
    const urlId = queryAdoptionId;
    if (selectedAdoptionId) {
      const shouldUpdateId = selectedAdoptionId !== urlId;
      const shouldUpdateDog =
        preferredDogId !== null && preferredDogId !== queryDogId;
      if (shouldUpdateId || shouldUpdateDog) {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set("adoptionId", String(selectedAdoptionId));
            if (preferredDogId) {
              next.set("dogId", String(preferredDogId));
            }
            return next;
          },
          { replace: true }
        );
      }
      return;
    }
    if (!selectedAdoptionId && urlId) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("adoptionId");
          next.delete("dogId");
          return next;
        },
        { replace: true }
      );
    }
  }, [
    preferredDogId,
    queryAdoptionId,
    queryDogId,
    selectedAdoptionId,
    setSearchParams,
  ]);

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
        console.log("[manage] inProgress adoptions:", items);
        const serverSummaries = items.map(toAdoptionSummary);
        setSummaries((prev) => dedupeSummaries(mergeSummaries(serverSummaries, prev)));
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
  }, [user?.userId]);

  const dedupedSummaries = useMemo(() => dedupeSummaries(summaries), [summaries]);
  const displaySummaries = dedupedSummaries;

  useEffect(() => {
    if (!preferredDogId) return;
    if (dedupedSummaries.length === 0) return;
    const matched = dedupedSummaries.find(
      (item) => parsePositiveNumber(item.dogId) === preferredDogId
    );
    const selected = matched ?? dedupedSummaries[0] ?? null;
    console.log("[manage] selected adoption:", selected);
    setSelectedAdoptionId(selected?.adoptionId ?? null);
  }, [preferredDogId, dedupedSummaries]);

  useEffect(() => {
    if (!selectedAdoptionId) return;
    if (isLoadingInProgress) return;
    const exists = dedupedSummaries.some(
      (item) => item.adoptionId === selectedAdoptionId
    );
    if (!exists) setSelectedAdoptionId(null);
  }, [selectedAdoptionId, dedupedSummaries, isLoadingInProgress]);

  useEffect(() => {
    // DEBUG: track selected adoptionId changes and caller stack
    console.debug("[manage] selectedAdoptionId change", {
      selectedAdoptionId,
      userId: user?.userId,
      stack: new Error().stack,
    });
  }, [selectedAdoptionId, user?.userId]);

  const { submitStep } = useMyPage(selectedAdoptionId, { skipAdoptionDetail: true });

  const {
    uiSteps,
    progressPct,
    currentStep: statusCurrentStep,
    currentLabel: statusCurrentLabel,
    processStatus,
    loading: stepsLoading,
    error: stepsError,
  } = useAdoptionStepsStatus(selectedAdoptionId, user?.userId);

  const resolvedCurrentStep = statusCurrentStep ?? "APPLICATION";
  const adoptionLoading = stepsLoading;
  const adoptionError = stepsError;

  // ✅ 진행 단계 / 선택 단계
  const [currentStep, setCurrentStep] = useState<AdoptionStep>(resolvedCurrentStep);
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(resolvedCurrentStep);

  // QA
  // 1) 진행중 입양 2개 이상에서 카드 57 클릭 -> URL ?adoptionId=57, survey/status가 57로 호출되는지 확인
  // 2) 관심강아지에서 입양하기 클릭 + 진행중 입양 존재 -> resolvedId 이동, URL/state 불일치 없음
  // 3) 진행중 입양 0개 -> 생성된 adoptionId로 이동, URL/state 일치 확인

  // server steps/status 변경되면 로컬 state 동기화
  useEffect(() => {
    // DEBUG: sync step state from server status mapping
    console.debug("[manage] sync steps from status", {
      selectedAdoptionId,
      statusCurrentStep,
      stack: new Error().stack,
    });
    setCurrentStep(resolvedCurrentStep);
    setSelectedStep(resolvedCurrentStep);
  }, [resolvedCurrentStep, selectedAdoptionId, statusCurrentStep]);

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때
  const advanceTo = (next: AdoptionStep) => {
    setCurrentStep(next);
    setSelectedStep(next);
  };

  const handleSubmitStep = useCallback(
    async (step: AdoptionStep) => {
      const result = await submitStep(step);
      if (result.status === "error") {
        const message =
          result.error instanceof Error ? result.error.message : "단계를 제출하지 못했습니다.";
        openAlert({ title: "제출 실패", message });
      }
    },
    [openAlert, submitStep]
  );

  const handleAdopt = useCallback(
    async (dog: LikedDog) => {
      if (!user?.userId) {
        throw new Error("로그인이 필요합니다.");
      }

      const dogId = parsePositiveNumber(dog.dogId ?? dog.id);
      if (!dogId) {
        throw new Error("강아지 정보를 확인할 수 없습니다.");
      }

      let createdAdoptionId: number | null = null;
      try {
        const response = await startAdoption({
          userId: user.userId,
          abandonedDogId: dogId,
        });
        createdAdoptionId = response.adoptionId;
      } catch (err) {
        console.warn("[adopt-create] failed, fallback to existing list", err);
      }

      const existing = await fetchAdoptionsByStatus(user.userId, "IN_PROGRESS");
      const matchedByDog = existing.find((item) => item.dogId === dogId);
      console.log("[manage] resolve existing adoption:", {
        clickedDogId: dogId,
        matchedAdoptionId: matchedByDog?.adoptionId ?? null,
      });

      const resolvedId =
        matchedByDog?.adoptionId ??
        createdAdoptionId ??
        (selectedAdoptionId &&
        existing.some((item) => item.adoptionId === selectedAdoptionId)
          ? selectedAdoptionId
          : null) ??
        (numericId && existing.some((item) => item.adoptionId === numericId)
          ? numericId
          : null) ??
        (pickLatestAdoption(existing)?.adoptionId ?? existing[0]?.adoptionId ?? null);

      if (!resolvedId) {
        throw new Error("Failed to resolve in-progress adoption.");
      }

      setSummaries((prev) => {
        const merged = mergeSummaries(existing.map(toAdoptionSummary), prev);
        const withCreated =
          createdAdoptionId &&
          !merged.some((item) => item.adoptionId === createdAdoptionId)
            ? [
                {
                  adoptionId: createdAdoptionId,
                  dogId: String(dogId),
                  dogName:
                    (typeof dog.name === "string" && dog.name.trim()) ||
                    (typeof dog.kindNm === "string" && dog.kindNm.trim()) ||
                    (typeof dog.noticeNo === "string" && dog.noticeNo.trim()) ||
                    (typeof dog.desertionNo === "string" && dog.desertionNo.trim()) ||
                    undefined,
                  dogImageUrl: normalizeImageUrl(dog.imageUrl) || undefined,
                  createdAt: new Date().toISOString(),
                },
                ...merged,
              ]
            : merged;
        return dedupeSummaries(withCreated);
      });

      setSelectedAdoptionId(resolvedId);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("adoptionId", String(resolvedId));
          next.set("dogId", String(dogId));
          return next;
        },
        { replace: true }
      );
    },
    [numericId, selectedAdoptionId, setSearchParams, user]
  );

  const handleCancelAdoption = useCallback(
    async (adoptionId: number) => {
      if (!adoptionId || cancellingIds.has(adoptionId)) return;
      setCancellingIds((prev) => new Set(prev).add(adoptionId));
      try {
        await cancelAdoptionProcess(adoptionId);
        setSummaries((prev) => prev.filter((item) => item.adoptionId !== adoptionId));
        setSelectedAdoptionId((prev) => (prev === adoptionId ? null : prev));
        openAlert({ title: "취소 완료", message: "입양이 취소되었습니다." });
      } catch (err) {
        const message = err instanceof Error ? err.message : "입양 취소에 실패했습니다.";
        openAlert({ title: "취소 실패", message });
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

  const hasOngoing = dedupedSummaries.length > 0;
  const selectedOngoing = useMemo(
    () => dedupedSummaries.find((item) => item.adoptionId === selectedAdoptionId) ?? null,
    [dedupedSummaries, selectedAdoptionId]
  );
  const shouldShowTimeline = hasOngoing && Boolean(selectedOngoing);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">입양 관리</h1>

      {adoptionError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {adoptionError}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">진행 중 입양</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displaySummaries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
              진행 중인 입양이 없습니다.
            </div>
          ) : (
            displaySummaries.map((summary) => {
              const isSelected = summary.adoptionId === selectedAdoptionId;
              const isCancelling = cancellingIds.has(summary.adoptionId);
              return (
                <div
                  key={`${summary.adoptionId}-${summary.dogId}`}
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
                    onClick={() => {
                      setSelectedAdoptionId(summary.adoptionId);
                      const summaryDogId = parsePositiveNumber(summary.dogId);
                      if (summaryDogId) {
                        setPreferredDogId(summaryDogId);
                        sessionStorage.setItem(
                          MANAGE_SELECTED_DOG_KEY,
                          String(summaryDogId)
                        );
                      }
                      setSearchParams(
                        (prev) => {
                          const next = new URLSearchParams(prev);
                          next.set("adoptionId", String(summary.adoptionId));
                          if (summary.dogId) {
                            next.set("dogId", String(summary.dogId));
                          } else {
                            next.delete("dogId");
                          }
                          return next;
                        },
                        { replace: true }
                      );
                    }}
                    className="flex w-full items-center gap-4 text-left"
                  >
                    {summary.dogImageUrl ? (
                      <img
                        src={normalizeImageUrl(summary.dogImageUrl)}
                        alt={summary.dogName ?? "강아지 사진"}
                        className="h-20 w-20 rounded-xl object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = imgFallback;
                        }}
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 text-[11px] text-gray-400"
                        aria-label="사진 없음"
                      >
                        사진 없음
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-semibold text-gray-900">
                        {summary.dogName ?? "이름 없음"}
                      </div>
                      <div className="text-xs text-gray-500">입양 ID: {summary.adoptionId}</div>
                      {summary.createdAt ? (
                        <div className="text-xs text-gray-400">
                          신청: {summary.createdAt.slice(0, 10)}
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
            uiSteps={uiSteps}
            progressPct={progressPct}
            currentLabel={statusCurrentLabel}
            processStatus={processStatus}
          />

          <NextActions
            currentStep={currentStep}
            selectedStep={selectedStep}
            onSelectStep={setSelectedStep}
            onAdvanceStep={advanceTo}
            onSubmitStep={handleSubmitStep}
            adoptionId={selectedAdoptionId ?? undefined}
            processStatus={processStatus}
          />
        </>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            입양 절차를 시작해보세요.
          </h3>
          <div className="mt-3">
            <Button asChild className="rounded-lg">
              <Link to={ROUTES.adoption}>입양 공고 보기</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3 pt-4">
        <h2 className="text-lg font-semibold text-gray-900">입양 시작</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-lg" onClick={() => setIsSelecting((prev) => !prev)}>
            {isSelecting ? "선택 닫기" : "입양 시작"}
          </Button>
          <span className="text-sm text-gray-500">
            관심 목록에서 강아지를 선택해 입양을 시작하세요.
          </span>
        </div>

        {isSelecting && (
          <SelectStep
            onAdopt={handleAdopt}
            onSubmitSuccess={() => {
              openAlert({ title: "입양 시작", message: "입양 신청이 시작되었습니다." });
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
