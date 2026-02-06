import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import { User } from "lucide-react";
import { ROUTES } from "@/shared/constants/routes";
import type { MemberMeResponse } from "@/features/member/types";

type Props = {
  user: MemberMeResponse;
};

export function ProfileSummary({ user }: Props) {
  const navigate = useNavigate();

  function handleEditProfile() {
    navigate(`${ROUTES.mypage}/edit`);
  }

  function handleManageAdoption() {
    navigate(ROUTES.manage);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between gap-6">
        {/* 좌측: 프로필 */}
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <User className="h-10 w-10 text-blue-500" />
          </div>

          <div>
            <div className="mb-2 flex items-center gap-3">
              <h3 className="text-2xl font-semibold text-gray-900">
                {user.username}
              </h3>
            </div>

            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* 우측 버튼 */}
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="mypage" size="sm" onClick={handleEditProfile}>
            정보 수정
          </Button>
          <Button variant="mypage" size="sm" onClick={handleManageAdoption}>
            입양 관리
          </Button>
        </div>
      </div>
    </div>
  );
}
