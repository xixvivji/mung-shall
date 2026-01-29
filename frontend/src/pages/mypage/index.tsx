import { useState } from "react";
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
import type { AdoptionInStep } from "@/features/mypage/types";

function AdopterMyPage() {
  const { summary, dogs, loading } = useMyPage();

  // ✅ 임시: 진행중 단계는 1단계 고정
  const currentStep: AdoptionInStep = "APPLICATION";

  // ✅ 선택 단계: 처음엔 currentStep으로 시작
  const [selectedStep, setSelectedStep] = useState<AdoptionInStep>(currentStep);

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

      <NextActions currentStep={currentStep} selectedStep={selectedStep} />

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
