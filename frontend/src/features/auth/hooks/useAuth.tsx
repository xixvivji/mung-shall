import { useCallback, useSyncExternalStore } from "react";
import type { AuthCredentials } from "../types";
import { login as loginApi, logout as logoutApi } from "../api/authApi";
import { authStore } from "../store/authStore";
import axios from "axios";

export default function useAuth() {
  const user = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot, authStore.getSnapshot);
  const isAuthenticated = Boolean(user);

  const login = useCallback(async (credentials: AuthCredentials) => {
    const loggedInUser = await loginApi(credentials);

    authStore.setUser(loggedInUser);

    if (loggedInUser?.accessToken) {

      localStorage.setItem("accessToken", loggedInUser.accessToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${loggedInUser.accessToken}`;
    }

    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();

    } finally {
      authStore.setUser(null);

      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  return { user, isAuthenticated, login, logout };
}