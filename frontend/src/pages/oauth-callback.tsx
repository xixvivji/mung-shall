import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api/authApi";
import { authStore } from "@/features/auth/store/authStore";
import { ROUTES } from "@/shared/constants/routes";
import { clearAuthTokens, setAuthTokens } from "@/shared/api/client";

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    const errorMessage = params.get("message");
    const accessToken = params.get("accessToken");

    if (errorCode) {
      setError(errorMessage ?? "소셜 로그인에 실패했습니다.");
      return;
    }

    if (!accessToken) {
      setError("소셜 로그인 토큰이 없습니다.");
      return;
    }

    setAuthTokens(accessToken);
    fetchMe(accessToken)
      .then((user) => {
        authStore.setUser(user);
        const userType = user?.userType?.toLowerCase();
        const nextRoute = userType === "shelter" || userType === "center" ? ROUTES.center : ROUTES.mypage;
        navigate(nextRoute, { replace: true });
      })
      .catch((err) => {
        clearAuthTokens();
        const message = err instanceof Error ? err.message : "소셜 로그인 처리에 실패했습니다.";
        setError(message);
      });
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-[#E5E7EB] bg-white px-6 py-12 shadow-sm">
      {error ? (
        <div className="text-center">
          <p className="text-[14px] text-[#d14343]">{error}</p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.login, { replace: true })}
            className="mt-4 rounded-[10px] border border-[#D1D5DB] bg-white px-4 py-2 text-[12px] text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111827]"
          >
            로그인으로 돌아가기
          </button>
        </div>
      ) : (
        <p className="text-[14px] text-[#737373]">소셜 로그인 처리 중...</p>
      )}
    </div>
  );
}
