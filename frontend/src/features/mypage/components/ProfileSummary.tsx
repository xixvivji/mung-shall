import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CheckCircle2, User } from "lucide-react";
import type { MemberMeResponse } from "@/features/member/types";

type Props = {
  user: MemberMeResponse;
};

export function ProfileSummary({ user }: Props) {
  // ✅ 기본값: 본인인증 안 된 상태
  const [isVerified, setIsVerified] = useState(false);

  function handleVerify() {
    // TODO: 나중에 본인인증 API 성공 후 true로 변경
    setIsVerified(true);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      {/* 전체를 좌(프로필) / 우(버튼) 2컬럼으로 분리 */}
      <div className="flex items-center justify-between gap-6">
        {/* 좌측: 아바타 + 텍스트 */}
        <div className="flex items-center gap-6">
          {/* 아바타 */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <User className="h-10 w-10 text-blue-500" />
          </div>

          <div>
            {/* 이름 + 인증 배지 */}
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-gray-900">
                {user.username}
              </h3>

              {isVerified && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  본인인증 완료
                </Badge>
              )}
            </div>

            {/* 이메일 (임시 더미) */}
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="outline" className="rounded-md">
            정보 수정
          </Button>

          {!isVerified && (
            <Button
              onClick={handleVerify}
              className="rounded-md bg-[#0064FF] hover:bg-[#0056E6]"
            >
              본인 인증
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
