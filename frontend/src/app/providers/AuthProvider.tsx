import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchMe } from "@/features/auth/api/authApi";
import { authStore } from "@/features/auth/store/authStore";
import { ApiError, setAuthExpiredHandler } from "@/shared/api/client";
import { createRefreshScheduler } from "@/shared/auth/refreshScheduler";
import AlertModal from "@/shared/components/AlertModal";

type AuthProviderProps = {
  children: ReactNode;
};

const AUTH_EXPIRED_MESSAGE = "로그인이 만료되었습니다. 다시 로그인해주세요.";

export default function AuthProvider({ children }: AuthProviderProps) {
  const user = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
  const [loading, setLoading] = useState(true);
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const isAuthenticated = Boolean(user);

  const expireSession = useCallback((message?: string) => {
    authStore.setUser(null);
    setExpiredMessage(message ?? AUTH_EXPIRED_MESSAGE);
  }, []);

  const refreshScheduler = useMemo(
    () =>
      createRefreshScheduler({
        onFailure: () => expireSession(AUTH_EXPIRED_MESSAGE),
      }),
    [expireSession]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchMe({ skipRefresh: true })
      .then((me) => {
        if (!active) return;
        authStore.setUser(me);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          authStore.setUser(null);
          return;
        }
        authStore.setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshScheduler.start();
    } else {
      refreshScheduler.stop();
    }
  }, [isAuthenticated, refreshScheduler]);

  useEffect(() => {
    return () => refreshScheduler.stop();
  }, [refreshScheduler]);

  useEffect(() => {
    if (isAuthenticated) {
      setExpiredMessage(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      expireSession(AUTH_EXPIRED_MESSAGE);
    });
    return () => setAuthExpiredHandler(null);
  }, [expireSession]);

  const handleExpiredClose = useCallback(() => {
    setExpiredMessage(null);
    window.location.assign("/auth/login");
  }, []);

  return (
    <>
      {children}
      <AlertModal
        open={Boolean(expiredMessage) && !loading}
        title="세션 만료"
        message={expiredMessage ?? ""}
        onClose={handleExpiredClose}
      />
    </>
  );
}
