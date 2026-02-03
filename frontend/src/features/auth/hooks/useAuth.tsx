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


    if (loggedInUser && loggedInUser.accessToken) {
      localStorage.setItem("accessToken", loggedInUser.accessToken);


      axios.defaults.headers.common["Authorization"] = `Bearer ${loggedInUser.accessToken}`;
    }

    authStore.setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {

    } finally {

      localStorage.removeItem("accessToken");
      delete axios.defaults.headers.common["Authorization"];

      authStore.setUser(null);
    }
  }, []);

  return { user, isAuthenticated, login, logout };
}