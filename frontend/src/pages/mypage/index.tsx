import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  PostAdoptionTools,
  ProfileSummary,
  useMyPage,
} from "@/features/mypage";

import useAuth from "@/features/auth/hooks/useAuth";
import CenterPage from "@/pages/center";

import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";

function AdopterMyPage() {
  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);

  // ✅ MyPage에서는 입양관리/해야할일을 제거했으므로
  // ✅ PostAdoptionTools에 필요한 post-adoption 데이터만 사용
  const {
    adoptionId,
    postAdoptionId,
    postAdoption,
    postAdoptionLoading,
    refreshPostAdoption,
    startPostAdoption,
  } = useMyPage();

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

  if (!memberInfo) {
    return <div className="px-6 py-16 text-sm text-[#777]">Loading...</div>;
  }

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 space-y-6">
      <h1 className="text-2xl font-semibold">마이페이지</h1>

      <ProfileSummary user={memberInfo} />

      {/* ✅ 입양관리/해야할일은 /manage로 이동 */}
      <div>
        <Link
          to="/manage"
          className="inline-flex items-center rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
        >
          입양 관리로 이동
        </Link>
      </div>

      {postAdoptionLoading && (
        <div className="text-sm text-[#777]">Loading...</div>
      )}

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
