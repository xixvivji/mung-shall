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
import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";

function AdopterMyPage() {
  const { dogs, loading } = useMyPage();
  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);

  // ✅ 임시: 진행중 단계 (전/중/후 아무거나 가능) — 이제 state로 관리
  const [currentStep, setCurrentStep] = useState<AdoptionStep>("SURVEY");

  // ✅ 선택 단계
  const [selectedStep, setSelectedStep] = useState<AdoptionStep>(currentStep);

  // (선택) currentStep이 바뀌면 선택 단계도 같이 따라가게
  useEffect(() => {
    setSelectedStep(currentStep);
  }, [currentStep]);

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

  // ✅ NextActions에서 "다음 단계로 진행" 요청했을 때 부모가 갱신
  const advanceTo = (next: AdoptionStep) => {
    setCurrentStep(next);
    setSelectedStep(next);
  };

  if (loading || !memberInfo) {
    return <div className="px-6 py-16 text-sm text-[#777]">???...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      <ProfileSummary user={memberInfo} />

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
