import { useCallback, useSyncExternalStore } from "react";
import type { AuthCredentials } from "../types";
import { login as loginApi, logout as logoutApi } from "../api/authApi";
import { clearAccessToken } from "@/shared/api/client";
import { authStore } from "../store/authStore";

export default function useAuth() {
  const user = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const loggedInUser = await loginApi(credentials);
    authStore.setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors to ensure local state is still cleared.
    } finally {
      clearAccessToken();
      authStore.setUser(null);
    }
  }, []);

  return { user, login, logout };
}
