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

  // ✅ 기존 설문 로딩 상태
  const [initial, setInitial] = useState<AdoptionSurveyAnswer | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  // ✅ 초기값이 준비되면 설문 훅에 주입
  const survey = useMatchingSurvey(initial ?? undefined);

  // ✅ 기존 설문 불러오기 (로그인 되어있을 때만)
  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setInitialLoading(true);
    setInitialError(null);

    getSurvey(userId)
      .then((dto) => {
        if (!mounted) return;
        setInitial(toAnswer(dto)); // ✅ 기존 답변을 initial로 세팅
      })
      .catch((e: unknown) => {
        if (!mounted) return;

        // 404/400 = 설문 없음 → 새로 작성
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

      // ✅ 1) 저장 (PUT or POST)
      const saved = await saveSurveyByUser(userId, a);
      console.log("saved survey (response):", saved);

      // ✅ 2) 바로 재조회해서 DB 반영 확인
      const check = await getSurvey(userId);
      console.log("check from db (GET):", check);

      // ✅ 3) 성공 시 이동
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

  // ✅ 초기 설문 로딩 중이면 화면 잠깐 막기
  if (initialLoading) {
    return <div className="px-6 py-16 text-sm text-[#777]">설문 불러오는 중...</div>;
  }

  if (initialError) {
    return (
      <div className="px-6 py-16 space-y-3">
        <div className="text-sm text-red-600">{initialError}</div>
        <button
          type="button"
          className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          onClick={() => window.location.reload()}
        >
          새로고침
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>유기견 추천 설문</h2>
        <span>
          {survey.stepIndex + 1}/{survey.total}
        </span>
      </div>

      <div style={{ height: 8, background: "#eee", borderRadius: 999, overflow: "hidden", marginBottom: 16 }}>
        <div style={{ width: `${survey.progress}%`, height: "100%", background: "#111" }} />
      </div>

      <h3 style={{ marginTop: 0 }}>{title}</h3>

      {errorMsg && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 10, background: "#fff3f3", border: "1px solid #ffd6d6" }}>
          <div style={{ fontSize: 13, color: "#b00020", fontWeight: 700 }}>{errorMsg}</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {options.map((op) => {
          const active = survey.selected === op.value;
          return (
            <button
              key={op.value}
              type="button"
              onClick={() => survey.setField(field, op.value)}
              disabled={submitting}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 14,
                border: active ? "2px solid #111" : "1px solid #ddd",
                background: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              <div style={{ fontWeight: 800 }}>{op.label}</div>
              {op.desc && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>{op.desc}</div>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        <button onClick={survey.prev} disabled={!survey.canPrev || submitting} type="button">
          이전
        </button>

        <button onClick={handleNextOrSubmit} disabled={!survey.canNext || submitting} type="button">
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
