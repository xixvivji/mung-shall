import { api, setAuthTokens } from "@/shared/api/client";
import type { AuthCredentials, AuthUser, SignUpRequest } from "../types";

type LoginResponse = {
  accessToken: string;
};

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  const { accessToken } = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
  });

  setAuthTokens(accessToken);
  return fetchMe(accessToken);
}

export async function fetchMe(accessToken?: string): Promise<AuthUser> {
  const authHeader = accessToken?.startsWith("Bearer ") ? accessToken : accessToken ? `Bearer ${accessToken}` : undefined;
  return api<AuthUser>("/members/me", {
    headers: authHeader ? { Authorization: authHeader } : undefined,
  });
}

export async function checkUsername(username: string) {
  const params = new URLSearchParams({ username });
  return api<{ isAvailable: boolean }>(`/auth/check-username?${params.toString()}`, {
    method: "GET",
    skipAuth: true,
  });
}

export async function checkEmail(email: string) {
  const params = new URLSearchParams({ email });
  return api<{ isAvailable: boolean }>(`/auth/check-email?${params.toString()}`, {
    method: "GET",
    skipAuth: true,
  });
}

export async function sendEmailCode(email: string) {
  return api<{ expireTime: string }>("/auth/email/send", {
    method: "POST",
    body: JSON.stringify({ email, purpose: "signup" }),
    skipAuth: true,
  });
}

export async function verifyEmailCode(email: string, code: string) {
  return api<{ isVerified: boolean }>("/auth/email/verify", {
    method: "POST",
    body: JSON.stringify({ email, purpose: "signup", code }),
    skipAuth: true,
  });
}

export async function signup(payload: SignUpRequest) {
  return api<{ message: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function logout() {
  return api<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}
