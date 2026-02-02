import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { PostAdoptionTools, ProfileSummary, useMyPage } from "@/features/mypage";
import useAuth from "@/features/auth/hooks/useAuth";
import CenterPage from "@/pages/center";

import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";

import { getSurvey } from "@/features/matching-survey/api/survey";
import { ApiError } from "@/shared/api/client";
import { toAnswer } from "@/features/matching-survey/model/mapper";
import type { AdoptionSurveyAnswer } from "@/features/matching-survey/model/types";
import { STEP_CONFIG } from "@/features/matching-survey/model/options";

// ✅ enum 값 -> 라벨로 변환
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

  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);

  // ✅ 설문 로딩/에러/데이터
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyError, setSurveyError] = useState<string | null>(null);
  const [surveyAnswer, setSurveyAnswer] = useState<AdoptionSurveyAnswer | null>(null);

  // ✅ MyPage에서는 입양관리/해야할일을 제거했으므로
  // ✅ PostAdoptionTools에 필요한 post-adoption 데이터만 사용
  const { postAdoptionId, postAdoption, postAdoptionLoading, refreshPostAdoption } = useMyPage();

  // 1) 내 정보 로드
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

  // 2) 설문 조회 (GET) - 값까지 받아서 보여주기
  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setSurveyLoading(true);
    setSurveyError(null);

    getSurvey(userId)
      .then((dto) => {
        if (!mounted) return;
        setSurveyAnswer(toAnswer(dto)); // ✅ 여기서 값 저장
      })
      .catch((e: unknown) => {
        if (!mounted) return;

        // 404/400 = 설문 없음
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

      {/* ✅ 추천 설문 보기(값 표시) */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">내 추천 설문</div>

          {/* 버튼은 항상 노출: 있으면 수정, 없으면 작성 */}
          <Link
            to="/matching-survey?from=mypage"
            className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            {hasSurvey ? "설문 수정하기" : "설문 작성하기"}
          </Link>
        </div>

        {surveyLoading ? (
          <div className="text-sm text-[#777]">설문 불러오는 중...</div>
        ) : surveyError ? (
          <div className="text-sm text-red-600">{surveyError}</div>
        ) : hasSurvey ? (
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-[#555]">활동성(휴식 시)</span>
              <span className="font-semibold">{labelFor("restActivityLevel", surveyAnswer.restActivityLevel)}</span>
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
              <span className="font-semibold">{labelFor("visitorFrequency", surveyAnswer.visitorFrequency)}</span>
            </div>

            <div className="text-xs text-[#777] mt-1">
              설문은 추천 매칭을 위해 사용돼요.
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#777]">
            아직 작성한 설문이 없어요. 위 버튼을 눌러 설문을 작성하면 추천을 받을 수 있어요.
          </div>
        )}
      </div>

      {/* ✅ 입양관리/해야할일은 /manage로 이동 */}
      <div>
        <Link
          to="/manage"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          입양 관리로 이동
        </Link>
      </div>

      {postAdoptionLoading && <div className="text-sm text-[#777]">Loading...</div>}

      <PostAdoptionTools
        adoptionId={adoptionId}
        postAdoptionId={postAdoptionId}
        steps={postAdoption?.steps}
        onRefresh={refreshPostAdoption}
        onStart={startPostAdoption}
      />
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
