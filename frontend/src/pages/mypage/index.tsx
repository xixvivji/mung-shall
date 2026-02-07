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
    return (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
    );
  }

  const hasSurvey = !!surveyAnswer;

  return (
      <section className="mx-auto max-w-6xl space-y-8 px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>

        <ProfileSummary user={memberInfo} />

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">내 추천 설문</h2>

            <div className="flex items-center gap-2">
              <Button asChild variant="mypage" size="default">
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
                  size="default"
                >
                  {deleteLoading ? "삭제 중..." : "설문 삭제"}
                </Button>

                {hasSurvey && (
                    <Button
                        type="button"
                        onClick={() => void handleDeleteSurvey()}
                        disabled={deleteLoading || surveyLoading}
                        variant="mypage"
                        size="sm"
                    >
                      {deleteLoading ? "삭제 중..." : "설문 삭제"}
                    </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {surveyLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">설문 불러오는 중...</div>
            ) : surveyError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {surveyError}
                </div>
            ) : hasSurvey ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-600">활동성(휴식 시)</span>
                      <span className="text-sm font-bold text-gray-900">
                    {labelFor("restActivityLevel", surveyAnswer.restActivityLevel)}
                  </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-600">거주 형태</span>
                      <span className="text-sm font-bold text-gray-900">
                    {labelFor("residenceType", surveyAnswer.residenceType)}
                  </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-600">외출 시간</span>
                      <span className="text-sm font-bold text-gray-900">
                    {labelFor("houseEmptyTime", surveyAnswer.houseEmptyTime)}
                  </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-600">털 빠짐 허용</span>
                      <span className="text-sm font-bold text-gray-900">
                    {labelFor("furTolerance", surveyAnswer.furTolerance)}
                  </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 md:col-span-2">
                      <span className="text-sm font-medium text-gray-600">방문자 빈도</span>
                      <span className="text-sm font-bold text-gray-900">
                    {labelFor("visitorFrequency", surveyAnswer.visitorFrequency)}
                  </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">💡 설문은 추천 매칭을 위해 사용돼요</p>
                </div>
              </div>

              <p className="text-xs text-gray-500">💡 설문은 추천 매칭을 위해 사용돼요</p>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 px-6 py-10 text-center">
              <div className="mb-2 text-sm font-medium text-gray-600">
                아직 작성한 설문이 없어요.
              </div>
              <div className="text-sm text-gray-500">
                위 버튼을 눌러 설문을 작성하면 추천을 받을 수 있어요.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 관심 강아지 목록 */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">관심 등록한 강아지</h2>

            <Button asChild variant="mypage" size="default">
              <Link to="/adoption">입양하러 가기</Link>
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">관심 등록한 강아지</h2>

              <Button asChild variant="mypage" size="sm">
                <Link to="/adoption">입양하러 가기</Link>
              </Button>
            </div>
          </div>

          <div className="p-6">
            {favoriteLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">불러오는 중...</div>
            ) : favoriteDogs.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-6 py-10 text-center">
                  <div className="mb-2 text-sm font-medium text-gray-600">관심 등록한 강아지가 없어요.</div>
                  <div className="text-sm text-gray-500">마음에 드는 강아지를 찾아 하트를 눌러보세요.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {favoriteDogs.map((dog) => {
                    const id = String(dog.dogId);

                    return (
                        <Link
                            key={id}
                            to={`/adoption/${dog.dogId}`}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-lg"
                        >
                          <div className="relative aspect-square overflow-hidden bg-gray-100">
                            {dog.imageUrl && (
                                <ImageWithFallback
                                    src={dog.imageUrl}
                                    alt={dog.kindNm ?? "dog"}
                                    className="absolute inset-0 h-full w-full scale-105 blur-[10px] brightness-90 object-cover transition duration-500"
                                    aria-hidden
                                />
                            )}

                            <div className="relative z-10 h-full w-full">
                              <ImageWithFallback
                                  src={dog.imageUrl ?? ""}
                                  alt={dog.kindNm ?? "dog"}
                                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                              />
                            </div>

                            <FavoriteHeart
                                active={isFavorite(id)}
                                disabled={pendingIds.has(id)}
                                onToggle={(e?: any) => {
                                  e?.preventDefault?.();
                                  void handleToggleFavorite(id);
                                }}
                            />
                          </div>

                          <div className="space-y-1.5 p-4">
                            <div className="font-semibold text-gray-900">
                              {dog.noticeNo ?? dog.desertionNo ?? dog.kindNm ?? `Dog #${dog.dogId}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              {dog.kindNm ?? "알 수 없음"} · {dog.age ?? "-"}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span>{dog.careNm ?? "-"}</span>
                            </div>
                          </div>
                        </Link>
                    );
                  })}
                </div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">강아지 훈련 정확도 확인 (다시 고민)</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 사용 조건 안내 */}
            <div className="rounded-xl bg-gray-50 px-6 py-10 text-center">
              <div className="text-sm text-gray-600">
                사후관리 로드맵을 모두 완성 후 사용 가능합니다.
              </div>
            </div>

            {/* 예시 영상 영역 */}
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <div className="mb-2 text-sm font-medium text-gray-700">
                예시 영상
              </div>
              <div className="text-sm text-gray-500">
                예시 영상이 여기에 표시됩니다.
              </div>
            </div>

            {/* AI 안내 문구 */}
            <div className="text-center text-sm text-gray-400">
              AI 추후 연결 예정
            </div>
          </div>

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