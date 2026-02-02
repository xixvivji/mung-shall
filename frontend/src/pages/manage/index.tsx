import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdoptionTimeline, NextActions, useMyPage } from "@/features/mypage";
import type { AdoptionStep } from "@/features/mypage/types";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";
import useAuth from "@/features/auth/hooks/useAuth";
import { ROUTES } from "@/shared/constants/routes";
import { Button } from "@/shared/ui/button";

/**
 * 입양자(Adopter) 전용 입양 관리 페이지 컴포넌트.
 * useMyPage 훅을 사용하여 입양 프로세스 데이터를 가져오고 관리합니다.
 */
function AdopterManagePage() {
  const { adoptionId: adoptionIdFromUrl } = useParams<{ adoptionId: string }>();
  const numericId = useMemo(() => {
    const id = Number(adoptionIdFromUrl);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [adoptionIdFromUrl]);

  const {
    adoptionId,
    adoptionLoading,
    adoptionError,
    currentStep: apiCurrentStep,
    submitStep,
  } = useMyPage(numericId);

  const { openAlert, alertProps } = useAlertModal();

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
  }, [apiCurrentStep]);

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

  // API 에러가 발생한 경우
  if (adoptionError) {
    return (
      <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
        <h1 className="text-2xl font-semibold">입양 관리</h1>
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-red-800">오류가 발생했습니다</h3>
          <p className="mt-2 text-sm text-red-600">{adoptionError}</p>
        </div>
        <AlertModal {...alertProps} />
      </section>
    );
  }

  // 로딩이 끝나고 adoptionId가 없는 경우 (진행 중인 입양이 없는 상태)
  if (!adoptionLoading && !adoptionId) {
    return (
      <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
        <h1 className="text-2xl font-semibold">입양 관리</h1>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-800">진행 중인 입양 절차가 없습니다.</h3>
          <p className="mt-2 text-sm text-gray-600">
            마음에 드는 아이를 찾아 입양을 신청하고, 이곳에서 과정을 관리해보세요.
          </p>
          <Button asChild className="mt-6 rounded-lg">
            <Link to={ROUTES.adoption}>유기견 보러가기</Link>
          </Button>
        </div>
        <AlertModal {...alertProps} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">입양 관리</h1>

      {adoptionLoading && (
        <div className="text-sm text-gray-500">입양 정보를 불러오는 중...</div>
      )}

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
        adoptionId={adoptionId}
      />

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
