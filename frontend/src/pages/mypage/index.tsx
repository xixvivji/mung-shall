import { useCallback, useEffect, useState } from "react";
import {
  AdoptionTimeline,
  MyDogs,
  NextActions,
  PostAdoptionTools,
  ProfileSummary,
  useMyPage,
} from "@/features/mypage";
import useAuth from "@/features/auth/hooks/useAuth";
import CenterPage from "@/pages/center";
import type { AdoptionStep } from "@/features/mypage/types";
import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";
import AlertModal from "@/shared/components/AlertModal";
import { useAlertModal } from "@/shared/hooks/useAlertModal";

function AdopterMyPage() {
  const {
    dogs,
    loading,
    adoptionId,
    adoptionLoading,
    adoptionError,
    postAdoptionLoading,
    postAdoptionError,
    currentStep: apiCurrentStep,
    submitStep,
  } = useMyPage();
  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);
  const { openAlert, alertProps } = useAlertModal();

  // ✅ 임시: 진행중 단계 (전/중/후 아무거나 가능) — 이제 state로 관리
  const [currentStep, setCurrentStep] = useState<AdoptionStep>(apiCurrentStep ?? "SURVEY");

  // ✅ 선택 단계
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(apiCurrentStep ?? "SURVEY");

  // (선택) currentStep이 바뀌면 선택 단계도 같이 따라가게
  useEffect(() => {
    setCurrentStep(apiCurrentStep ?? "SURVEY");
    setSelectedStep(apiCurrentStep ?? "SURVEY");
  }, [apiCurrentStep]);

  useEffect(() => {
    let mounted = true;
    fetchMyInfo()
      .then((data) => {
        if (mounted) {
          setMemberInfo(data);
        }
      })
      .catch(() => {
        if (mounted) {
          setMemberInfo(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (adoptionError) {
      openAlert({ title: "입양 과정 오류", message: adoptionError });
    }
  }, [adoptionError, openAlert]);

  useEffect(() => {
    if (postAdoptionError) {
      openAlert({ title: "입양 후 과정 오류", message: postAdoptionError });
    }
  }, [postAdoptionError, openAlert]);

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때 부모가 갱신
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

  if (loading || !memberInfo) {
    return <div className="px-6 py-16 text-sm text-[#777]">???...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      <ProfileSummary user={memberInfo} />

      {(adoptionLoading || postAdoptionLoading) && (
        <div className="text-sm text-[#777]">Loading...</div>
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
        adoptionId={adoptionId ?? undefined}
      />

      <MyDogs dogs={dogs} />

      <PostAdoptionTools />
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
