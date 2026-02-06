import { useEffect, useState } from "react";

import { ProfileSummary } from "@/features/mypage";
import useAuth from "@/features/auth/hooks/useAuth";
import CenterPage from "@/pages/center";

import { fetchMyInfo } from "@/features/member/api/memberApi";
import type { MemberMeResponse } from "@/features/member/types";

function AdopterMyPage() {
  const { user } = useAuth();
  const userId = user?.userId;

  const [memberInfo, setMemberInfo] = useState<MemberMeResponse | null>(null);

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

  return (
      <section className="space-y-6">
        {memberInfo ? <ProfileSummary user={memberInfo} /> : null}
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
