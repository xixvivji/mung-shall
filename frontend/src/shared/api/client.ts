const API_BASE = "/api";
const ACCESS_TOKEN_KEY = "accessToken";
const AUTH_USER_KEY = "authUser";
const REFRESH_WINDOW_MS = 2 * 60 * 1000;

let cachedToken: string | null = null;
let cachedExpMs: number | null = null;
let refreshPromise: Promise<string> | null = null;
let authEpoch = 0;

function bumpAuthEpoch() {
  authEpoch += 1;
}

function getAuthEpoch() {
  return authEpoch;
}

export function getAccessToken() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token !== cachedToken) {
    cachedToken = token;
    cachedExpMs = token ? getJwtExpMs(token) : null;
  }
  return token;
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  cachedToken = token;
  cachedExpMs = token ? getJwtExpMs(token) : null;
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  cachedToken = null;
  cachedExpMs = null;
}

export function setAuthTokens(accessToken: string) {
  setAccessToken(accessToken);
}

export function clearAuthTokens() {
  clearAccessToken();
  localStorage.removeItem(AUTH_USER_KEY);
  bumpAuthEpoch();
}

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  retry?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, retry, credentials, ...init } = options;
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (isFormData && headers.has("Content-Type")) {
    headers.delete("Content-Type");
  }

  if (!skipAuth && !skipRefresh) {
    const token = getAccessToken();
    const remainingMs = token ? getTokenRemainingMs(token) : null;
    if (remainingMs !== null && remainingMs <= REFRESH_WINDOW_MS && remainingMs > 0) {
      if (import.meta.env.DEV) {
        console.debug("[auth] token expiring soon", { remainingMs });
      }
      await requestAccessTokenRefresh();
    }
  }

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestId = createRequestId();
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", requestId);
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    } else if (!token && headers.has("Authorization")) {
      headers.delete("Authorization");
    }
  }

  if (import.meta.env.DEV) {
    const authHeader = headers.get("Authorization");
    console.debug("[http] request", {
      requestId,
      path,
      method: init.method ?? "GET",
      hasAuth: Boolean(authHeader),
      authMasked: authHeader ? `${authHeader.slice(0, 10)}...` : null,
    });
  }

  const shouldIncludeCredentials =
    credentials ?? (path.startsWith("/auth/") ? "include" : "omit");

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: shouldIncludeCredentials,
  });

  if (response.status === 401 && !skipAuth && !skipRefresh && !retry && !isRefreshPath(path)) {
    try {
      await requestAccessTokenRefresh();
      if (import.meta.env.DEV) {
        console.debug("[auth] retrying request after refresh", { path });
      }
      return api<T>(path, { ...options, retry: true });
    } catch {
      // Refresh errors handled in requestAccessTokenRefresh.
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || response.statusText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed && typeof parsed.message === "string") {
        message = parsed.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, message || response.statusText);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isRefreshPath(path: string) {
  return path.startsWith("/auth/refresh");
}

function getTokenRemainingMs(token: string) {
  const expMs = token === cachedToken ? cachedExpMs : getJwtExpMs(token);
  if (!expMs) return null;
  return expMs - Date.now();
}

function getJwtExpMs(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

function decodeJwtPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded) as { exp?: number };
  } catch {
    return null;
  }
}

export async function requestAccessTokenRefresh(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const startedEpoch = getAuthEpoch();
    if (import.meta.env.DEV) {
      console.debug("[auth] refresh start");
    }
    const requestId = createRequestId();
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (import.meta.env.DEV) {
        console.debug("[auth] refresh failed", {
          status: response.status,
          errorText,
        });
      }
      if (response.status === 401 || response.status === 403) {
        clearAuthTokens();
        if (typeof window !== "undefined") {
          window.location.assign("/auth/login");
        }
      }
      throw new ApiError(response.status, errorText || response.statusText);
    }

    const data = (await response.json()) as { accessToken?: string };
    if (!data.accessToken) {
      throw new ApiError(500, "Missing accessToken in refresh response.");
    }

    if (getAuthEpoch() !== startedEpoch) {
      if (import.meta.env.DEV) {
        console.debug("[auth] refresh result ignored due to auth epoch mismatch");
      }
      return data.accessToken;
    }

    setAuthTokens(data.accessToken);

    if (import.meta.env.DEV) {
      console.debug("[auth] refresh success");
    }
    return data.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}
