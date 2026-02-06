import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { User } from "lucide-react";
import type { MemberMeResponse } from "@/features/member/types";

type Props = {
  user: MemberMeResponse;
};

export function ProfileSummary({ user }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {/* 전체를 좌(프로필) / 우(버튼) 2컬럼으로 분리 */}
      <div className="flex items-center justify-between gap-6">
        {/* 좌측: 아바타 + 텍스트 */}
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <User className="h-8 w-8 text-blue-500" />
          </div>

          <div>
            {/* 이름 */}
            <h3 className="mb-1 text-xl font-bold text-gray-900">
              {user.username}
            </h3>

            {/* 이메일 */}
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* 우측: 액션 버튼 */}
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="mypage" size="sm">
            정보 수정
          </Button>

          <Button asChild variant="mypage" size="sm">
            <Link to="/manage">입양 관리</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}