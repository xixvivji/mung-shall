import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ProfileSummary } from "@/features/mypage";
import useAuth from "@/features/auth/hooks/useAuth";
import CenterPage from "@/pages/center";
import { Button } from "@/shared/ui/button";

import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";

import { getSurvey, deleteSurvey } from "@/features/matching-survey/api/survey";
import { ApiError } from "@/shared/api/client";
import { toAnswer } from "@/features/matching-survey/model/mapper";
import type { AdoptionSurveyAnswer } from "@/features/matching-survey/model/types";
import { STEP_CONFIG } from "@/features/matching-survey/model/options";

import useFavoriteDogs, { resolveFavoriteErrorMessage } from "@/features/adoption/hooks/useFavoriteDogs";
import FavoriteHeart from "@/shared/components/FavoriteHeart";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import { ImageWithFallback } from "@/shared/ui/figma/ImageWithFallback";
import { MapPin } from "lucide-react";

function labelFor(field: keyof AdoptionSurveyAnswer, value?: string) {
  if (!value) return "-";
  const cfg = Object.values(STEP_CONFIG).find((c) => c.field === field);
  if (!cfg) return value;
  const opt = cfg.options.find((o) => o.value === value);
  return opt?.label ?? value;
}

function AdopterMyPage() {
  const { user } = useAuth();
  const userId = user?.userId;

  const { openAlert, alertProps } = useAlertModal();
  const { favoriteDogs, pendingIds, toggleFavorite, isFavorite, loading: favoriteLoading } = useFavoriteDogs();

  const handleToggleFavorite = async (dogId: string | number) => {
    const result = await toggleFavorite(dogId);
    if (result.status === "unauthenticated") {
      openAlert({ title: "로그인 필요", message: "로그인이 필요합니다." });
      return;
    }
    if (result.status === "error") {
      openAlert({
        title: "관심 등록 실패",
        message: resolveFavoriteErrorMessage(result.error),
      });
    }
  };

  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);

  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [surveyAnswer, setSurveyAnswer] = useState<AdoptionSurveyAnswer | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteSurvey = async () => {
    if (!userId) return;

    const ok = window.confirm("추천 설문을 삭제할까요?\n삭제하면 복구할 수 없어요.");
    if (!ok) return;

    try {
      setDeleteLoading(true);
      await deleteSurvey(Number(userId));

      // UI 즉시 반영
      setSurveyAnswer(null);
      setSurveyError(null);

      openAlert({ title: "삭제 완료", message: "추천 설문이 삭제되었습니다." });
    } catch (e: unknown) {
      console.error("[mypage deleteSurvey] failed:", e);
      openAlert({
        title: "삭제 실패",
        message: "설문 삭제에 실패했어요. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    fetchMyInfo()
      .then((data) => {
        if (mounted) setMemberInfo(data);
      })
      .catch(() => {
        if (mounted) setMemberInfo(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setSurveyLoading(true);
    setSurveyError(null);

    getSurvey(Number(userId))
      .then((dto) => {
        if (!mounted) return;
        setSurveyAnswer(toAnswer(dto));
      })
      .catch((e: unknown) => {
        if (!mounted) return;

        if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
          setSurveyAnswer(null);
          return;
        }

        console.error("[mypage getSurvey] failed:", e);
        setSurveyError("설문 정보를 불러오지 못했어요.");
        setSurveyAnswer(null);
      })
      .finally(() => {
        if (mounted) setSurveyLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!memberInfo) {
    return <div className="px-6 py-16 text-sm text-[#777]">Loading...</div>;
  }

  const hasSurvey = !!surveyAnswer;

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      <ProfileSummary user={memberInfo} />

      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">내 추천 설문</div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="mypage"
              size="sm"
              className="px-3 py-2 text-sm"
            >
              <Link to="/matching-survey?from=mypage">
                {hasSurvey ? "설문 수정하기" : "설문 작성하기"}
              </Link>
            </Button>

            {hasSurvey && (
              <Button
                type="button"
                onClick={() => void handleDeleteSurvey()}
                disabled={deleteLoading || surveyLoading}
                variant="mypage"
                size="sm"
                className="px-3 py-2 text-sm"
              >
                {deleteLoading ? "삭제 중..." : "설문 삭제"}
              </Button>
            )}
          </div>
        </div>

        {surveyLoading ? (
          <div className="text-sm text-[#777]">설문 불러오는 중...</div>
        ) : surveyError ? (
          <div className="text-sm text-red-600">{surveyError}</div>
        ) : hasSurvey ? (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">활동성(휴식 시)</span>
              <span className="font-semibold">
                {labelFor("restActivityLevel", surveyAnswer.restActivityLevel)}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">거주 형태</span>
              <span className="font-semibold">{labelFor("residenceType", surveyAnswer.residenceType)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">외출 시간</span>
              <span className="font-semibold">{labelFor("houseEmptyTime", surveyAnswer.houseEmptyTime)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">털 빠짐 허용</span>
              <span className="font-semibold">{labelFor("furTolerance", surveyAnswer.furTolerance)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">방문자 빈도</span>
              <span className="font-semibold">
                {labelFor("visitorFrequency", surveyAnswer.visitorFrequency)}
              </span>
            </div>

            <div className="text-xs text-[#777] mt-1">설문은 추천 매칭을 위해 사용돼요.</div>
          </div>
        ) : (
          <div className="text-sm text-[#777]">
            아직 작성한 설문이 없어요. 위 버튼을 눌러 설문을 작성하면 추천을 받을 수 있어요.
          </div>
        )}
      </div>

      <div>
        <Button
          asChild
          variant="mypage"
          size="sm"
          className="px-4 py-2 text-sm"
        >
          <Link to="/manage">입양 관리로 이동</Link>
        </Button>
      </div>

      {/* 관심 강아지 목록 */}
      <section className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">관심 등록한 강아지</div>

          <Button
            asChild
            variant="mypage"
            size="sm"
            className="px-3 py-2 text-sm"
          >
            <Link to="/adoption">입양하러 가기</Link>
          </Button>
        </div>

        {favoriteLoading ? (
          <div className="text-sm text-[#777]">불러오는 중...</div>
        ) : favoriteDogs.length === 0 ? (
          <div className="text-sm text-[#777]">관심 등록한 강아지가 없어요.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteDogs.map((dog) => {
              const id = String(dog.dogId);

              return (
                <Link
                  key={id}
                  to={`/adoption/${dog.dogId}`}
                  className="group relative rounded-xl border border-gray-100 bg-white p-3 hover:bg-gray-50"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
                    {dog.imageUrl && (
                    <ImageWithFallback
                      src={dog.imageUrl}
                      alt={dog.kindNm ?? "dog"}
                      className="absolute inset-0 h-full w-full object-cover scale-[1.05] blur-[10px] brightness-90 transition duration-500"
                      aria-hidden
                    />
                    )}

                    <div className="relative z-10 h-full w-full">
                      <ImageWithFallback
                        src={dog.imageUrl ?? ""}
                        alt={dog.kindNm ?? "dog"}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    {/* 하트 토글 */}
                    <FavoriteHeart
                      active={isFavorite(id)}
                      disabled={pendingIds.has(id)}
                      onToggle={(e?: any) => {
                        // Link 클릭 막고 하트만 토글
                        e?.preventDefault?.();
                        void handleToggleFavorite(id);
                      }}
                    />
                  </div>

                  <div className="mt-3 space-y-1">
                    <div className="font-medium text-gray-900">
                      {dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {dog.kindNm ?? "알 수 없음"} · {dog.age ?? "-"}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{dog.careNm ?? "-"}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <AlertModal {...alertProps} />
    </section>
  );
}

export default function MyPage() {
  const { user } = useAuth();
  const userType = user?.userType?.toLowerCase();

  if (userType === "shelter" || userType === "center") {
    return <CenterPage />;
  }

  return <AdopterMyPage />;
}
