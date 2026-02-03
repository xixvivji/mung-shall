import type { AuthUser } from "../types";

let currentUser: AuthUser | null = null;
const listeners = new Set<() => void>();

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
    emit();
  },
};
