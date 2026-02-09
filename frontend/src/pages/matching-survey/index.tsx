import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import useAuth from "@/features/auth/hooks/useAuth";
import { ApiError } from "@/shared/api/client";

import { useMatchingSurvey } from "@/features/matching-survey/hooks/useMatchingSurvey";
import { getSurvey } from "@/features/matching-survey/api/survey";
import { toAnswer } from "@/features/matching-survey/model/mapper";
import { saveSurveyByUser } from "@/features/matching-survey/api/surveyUpsert";
import type { AdoptionSurveyAnswer } from "@/features/matching-survey/model/types";

export default function MatchingSurveyPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const from = (params.get("from") ?? "adoption") as "adoption" | "mypage";

  const { user } = useAuth();
  const userId = user?.userId;

  const [initial, setInitial] = useState<AdoptionSurveyAnswer | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  const survey = useMatchingSurvey(initial ?? undefined);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setInitialLoading(true);
    setInitialError(null);

    getSurvey(userId)
      .then((dto) => {
        if (!mounted) return;
        setInitial(toAnswer(dto));
      })
      .catch((e: unknown) => {
        if (!mounted) return;

        if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
          setInitial(null);
          return;
        }

        console.error("[getSurvey] failed:", e);
        setInitialError("기존 설문을 불러오지 못했어요.");
        setInitial(null);
      })
      .finally(() => {
        if (mounted) setInitialLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  const { title, field, options } = survey.config;

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const buttonLabel = useMemo(() => {
    if (submitting) return "저장 중...";
    return survey.isLast ? "추천 결과 보기" : "다음";
  }, [submitting, survey.isLast]);

  const handleNextOrSubmit = async () => {
    setErrorMsg(null);

    if (!survey.isLast) {
      survey.next();
      return;
    }

    if (!userId) {
      setErrorMsg("로그인이 필요합니다.");
      return;
    }

    const a = survey.answer;
    const isComplete =
      !!a.restActivityLevel &&
      !!a.residenceType &&
      !!a.houseEmptyTime &&
      !!a.furTolerance &&
      !!a.visitorFrequency;

    if (!isComplete) {
      setErrorMsg("모든 질문에 답변해야 추천을 받을 수 있어요.");
      return;
    }

    try {
      setSubmitting(true);

      const saved = await saveSurveyByUser(userId, a);
      console.log("saved survey (response):", saved);

      const check = await getSurvey(userId);
      console.log("check from db (GET):", check);

      navigate("/adoption/recommend", { state: { answer: a, from } });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        console.error("[saveSurvey] ApiError:", e.status, e.message);
        if (e.status === 400) setErrorMsg("요청 값이 올바르지 않아요. 다시 확인해주세요.");
        else setErrorMsg(`설문 저장 실패 (${e.status})`);
      } else {
        console.error("[saveSurvey] Unknown error:", e);
        setErrorMsg("설문 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">설문 불러오는 중...</div>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="mx-auto max-w-md space-y-4 px-6 py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {initialError}
        </div>
        <button
          type="button"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          onClick={() => window.location.reload()}
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* 상단: 진행도 표시 */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">내 추천 설문</h1>
          <span className="text-sm font-medium text-gray-600">
            {survey.stepIndex + 1} / {survey.total}
          </span>
        </div>
        
        {/* 프로그레스 바 */}
        <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-900 transition-all duration-500 ease-out"
            style={{ width: `${survey.progress}%` }}
          />
        </div>
      </div>

      {/* 질문 영역 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      {/* 에러 메시지 */}
      {errorMsg && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{errorMsg}</p>
        </div>
      )}

      {/* 옵션 그리드 */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((op) => {
          const active = survey.selected === op.value;
          return (
            <button
              key={op.value}
              type="button"
              onClick={() => survey.setField(field, op.value)}
              disabled={submitting}
              className={`
                relative rounded-xl border-2 bg-white p-4 text-left transition-all
                ${active 
                  ? "border-gray-900" 
                  : "border-gray-200 hover:border-gray-300"
                }
                ${submitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
              `}
            >
              <div className="font-semibold text-gray-900">{op.label}</div>
              {op.desc && (
                <div className="mt-1 text-sm text-gray-600">
                  {op.desc}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={survey.prev}
          disabled={!survey.canPrev || submitting}
          type="button"
          className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          이전
        </button>

        <button
          onClick={handleNextOrSubmit}
          disabled={!survey.canNext || submitting}
          type="button"
          className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}