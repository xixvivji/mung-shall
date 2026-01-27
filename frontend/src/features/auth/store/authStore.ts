import { getAccessToken } from "@/shared/api/client";
import type { AuthUser } from "../types";

const AUTH_USER_KEY = "authUser";

let currentUser: AuthUser | null = null;
const listeners = new Set<() => void>();

const loadStoredUser = (): AuthUser | null => {
  if (!getAccessToken()) {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }

  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

currentUser = loadStoredUser();

const emit = () => {
  listeners.forEach((listener) => listener());
};

export const authStore = {
  getSnapshot: () => currentUser,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setUser: (user: AuthUser | null) => {
    currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    emit();
  },
};
