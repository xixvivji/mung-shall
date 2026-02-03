import { api } from "@/shared/api/client";
import type { AuthCredentials, AuthUser, SignUpRequest } from "../types";

export async function login(credentials: AuthCredentials): Promise<AuthUser> {
  await api<void>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    skipAuth: true,
    skipRefresh: true,
  });

  return fetchMe();
}

export async function fetchMe(options?: { skipRefresh?: boolean }): Promise<AuthUser> {
  return api<AuthUser>("/members/me", {
    method: "GET",
    skipRefresh: options?.skipRefresh,
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
