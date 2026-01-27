import { useCallback, useSyncExternalStore } from "react";
import type { AuthCredentials, AuthUser } from "../types";
import { login as loginApi } from "../api/authApi";
import { authStore } from "../store/authStore";

export default function useAuth() {
  const user = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const loggedInUser = await loginApi(credentials);
    authStore.setUser(loggedInUser);
    return loggedInUser;
  }, []);

  return { user, login };
}
