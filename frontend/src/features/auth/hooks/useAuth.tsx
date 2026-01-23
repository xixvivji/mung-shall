import { useState } from "react";
import type { AuthCredentials, AuthUser } from "../types";
import { login as loginApi } from "../api/authApi";

export default function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (credentials: AuthCredentials) => {
    const loggedInUser = await loginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  return { user, login };
}
