import { useEffect, useState } from "react";
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

function AdopterMyPage() {
  const { summary, dogs, loading } = useMyPage();

  // ✅ 임시: 진행중 단계 (전/중/후 아무거나 가능) — 이제 state로 관리
  const [currentStep, setCurrentStep] = useState<AdoptionStep>("SURVEY");

  // ✅ 선택 단계
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(currentStep);

  // (선택) currentStep이 바뀌면 선택 단계도 같이 따라가게
  useEffect(() => {
    setSelectedStep(currentStep);
  }, [currentStep]);

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때 부모가 갱신
  const advanceTo = (next: AdoptionStep) => {
    setCurrentStep(next);
    setSelectedStep(next);
  };

  if (loading || !summary) {
    return <div className="px-6 py-16 text-sm text-[#777]">마이페이지를 불러오는 중...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      <ProfileSummary summary={summary} />

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
      />

      <MyDogs dogs={dogs} />

      <PostAdoptionTools />
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
