import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe } from "@/features/auth/api/authApi";
import { authStore } from "@/features/auth/store/authStore";
import { ApiError, refreshAccessToken } from "@/shared/api/client";
import { ROUTES } from "@/shared/constants/routes";

const DEFAULT_ERROR_MESSAGE = "소셜 로그인에 실패했습니다. 다시 시도해주세요.";

function stripAccessTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("accessToken")) return;
  params.delete("accessToken");
  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

function resolveNextRoute(userType?: string | null) {
  const normalized = userType?.toLowerCase();
  return normalized === "shelter" || normalized === "center" ? ROUTES.center : ROUTES.mypage;
}

function resolveErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "로그인이 만료되었습니다. 다시 로그인해주세요.";
    }
    return error.message || DEFAULT_ERROR_MESSAGE;
  }
  if (error instanceof Error) return error.message || DEFAULT_ERROR_MESSAGE;
  return DEFAULT_ERROR_MESSAGE;
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stripAccessTokenFromUrl();

    const finalizeLogin = async () => {
      try {
        const user = await fetchMe({ skipRefresh: true });
        authStore.setUser(user);
        navigate(resolveNextRoute(user?.userType), { replace: true });
        return;
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          try {
            await refreshAccessToken("reactive");
            const user = await fetchMe({ skipRefresh: true });
            authStore.setUser(user);
            navigate(resolveNextRoute(user?.userType), { replace: true });
            return;
          } catch (refreshErr) {
            const message = resolveErrorMessage(refreshErr);
            setError(message);
            window.setTimeout(() => {
              navigate(ROUTES.login, { replace: true, state: { error: message } });
            }, 400);
            return;
          }
        }

        const message = resolveErrorMessage(err);
        setError(message);
        window.setTimeout(() => {
          navigate(ROUTES.login, { replace: true, state: { error: message } });
        }, 400);
      }
    };

    void finalizeLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {error ? (
        <div className="text-center">
          <p className="text-[14px] text-[#d14343]">{error}</p>
          <p className="mt-2 text-[12px] text-[#737373]">로그인 페이지로 이동 중...</p>
        </div>
      ) : (
        <p className="text-[14px] text-[#737373]">소셜 로그인 처리 중...</p>
      )}
    </div>
  );
}

