import { authStore } from "@/features/auth/store/authStore";
import {
  clearAuthTokens,
  getAccessToken,
  requestAccessTokenRefresh,
} from "@/shared/api/client";

const REFRESH_INTERVAL_MS = 1 * 60 * 1000;
let refreshTimer: number | null = null;
let refreshPromise: Promise<string> | null = null;
let lastRefreshAt = 0;
let visibilityListenerAttached = false;

function log(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log("[auth-refresh]", ...args);
  }
}

export async function requestRefresh(): Promise<string> {
  return requestAccessTokenRefresh();
}

function clearRefreshTimer() {
  if (refreshTimer !== null) {
    window.clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function resetSession() {
  clearAuthTokens();
  authStore.setUser(null);
}

async function handleRefreshFailure(error: unknown) {
  log("refresh failed; ending session", error);
  stopRefreshLoop();
  resetSession();
}

export async function refreshOnce(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    log("refresh start");
    const token = await requestRefresh();
    lastRefreshAt = Date.now();
    log("refresh success", new Date(lastRefreshAt).toLocaleTimeString());
    return token;
  })()
    .catch((error) => {
      log("refresh error", error);
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function scheduleNextRefresh() {
  clearRefreshTimer();

  if (!getAccessToken()) {
    return;
  }

  refreshTimer = window.setTimeout(async () => {
    try {
      await refreshOnce();
      scheduleNextRefresh();
    } catch (error) {
      await handleRefreshFailure(error);
    }
  }, REFRESH_INTERVAL_MS);

  log("next refresh scheduled in ms", REFRESH_INTERVAL_MS);
}

async function refreshIfNeededOnVisible() {
  if (typeof document === "undefined") {
    return;
  }

  if (document.visibilityState !== "visible") {
    return;
  }

  if (!getAccessToken()) {
    return;
  }

  const now = Date.now();
  const elapsed = lastRefreshAt > 0 ? now - lastRefreshAt : REFRESH_INTERVAL_MS;
  if (elapsed < REFRESH_INTERVAL_MS) {
    return;
  }

  log("tab visible; running immediate refresh", {
    elapsedMs: elapsed,
  });

  try {
    await refreshOnce();
    scheduleNextRefresh();
  } catch (error) {
    await handleRefreshFailure(error);
  }
}

function attachVisibilityListener() {
  if (typeof document === "undefined") {
    return;
  }

  if (visibilityListenerAttached) {
    return;
  }

  document.addEventListener("visibilitychange", refreshIfNeededOnVisible);
  visibilityListenerAttached = true;
}

function detachVisibilityListener() {
  if (typeof document === "undefined") {
    return;
  }

  if (!visibilityListenerAttached) {
    return;
  }

  document.removeEventListener("visibilitychange", refreshIfNeededOnVisible);
  visibilityListenerAttached = false;
}

export function startRefreshLoop() {
  if (typeof window === "undefined") {
    return;
  }

  if (!getAccessToken()) {
    log("startRefreshLoop skipped; no access token");
    return;
  }

  if (lastRefreshAt === 0) {
    lastRefreshAt = Date.now();
  }

  attachVisibilityListener();
  scheduleNextRefresh();
  log("startRefreshLoop");
}

export function stopRefreshLoop() {
  if (typeof window === "undefined") {
    return;
  }

  clearRefreshTimer();
  detachVisibilityListener();
  refreshPromise = null;
  lastRefreshAt = 0;
  log("stopRefreshLoop");
}
