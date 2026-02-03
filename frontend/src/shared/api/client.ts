const API_BASE = "/api";

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
  skipRefresh?: boolean;
  retry?: boolean;
};

export type RefreshReason = "reactive" | "proactive";

type AuthExpiredHandler = (reason: RefreshReason, error: ApiError) => void;

let authExpiredHandler: AuthExpiredHandler | null = null;
let refreshPromise: Promise<void> | null = null;

export function setAuthExpiredHandler(handler: AuthExpiredHandler | null) {
  authExpiredHandler = handler;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await apiRequest(path, options);

  if (!response.ok) {
    throw await buildApiError(response);
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

export async function apiBlob(path: string, options: ApiOptions = {}): Promise<Blob> {
  const response = await apiRequest(path, options);

  if (!response.ok) {
    throw await buildApiError(response);
  }

  return response.blob();
}

export async function refreshAccessToken(reason: RefreshReason = "reactive"): Promise<void> {
  if (refreshPromise) {
    if (import.meta.env.DEV) {
      console.info("[auth] refresh lock used", { reason });
    }
    return refreshPromise;
  }

  if (import.meta.env.DEV) {
    console.warn("[auth] refresh attempt", { reason });
  }

  refreshPromise = (async () => {
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
      const error = await buildApiError(response);
      if (response.status === 401 || response.status === 403) {
        authExpiredHandler?.(reason, error);
      }
      throw error;
    }

    const { accessToken } = await response.json();
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
  })();

  try {
    await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function apiRequest(path: string, options: ApiOptions): Promise<Response> {
  const { skipAuth, skipRefresh, retry, credentials, ...init } = options;
  const headers = new Headers(init.headers);
  const token = localStorage.getItem("accessToken");
  if (token && !_skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = init.body !== undefined;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestId = createRequestId();
  if (!headers.has("X-Request-Id")) {
    headers.set("X-Request-Id", requestId);
  }

  if (import.meta.env.DEV) {
    if (skipAuth) {
      console.debug("[auth] skipAuth enabled", { path, requestId });
    }
    if (credentials && credentials !== "include") {
      console.warn("[http] credentials override ignored", { path, requestId, credentials });
    }
    console.debug("[http] request", {
      requestId,
      path,
      method: init.method ?? "GET",
    });
  }

  const accessToken = localStorage.getItem("accessToken");

  if (!skipAuth && accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "omit",
  });

  if (response.status === 401 && !skipRefresh && !retry && !isAuthPath(path)) {
    try {
      await refreshAccessToken("reactive");
      if (import.meta.env.DEV) {
        console.debug("[auth] retrying request after refresh", { path });
      }
      return apiRequest(path, { ...options, retry: true });
    } catch {
      // refreshAccessToken handles auth expiry.
    }
  }

  return response;
}

async function buildApiError(response: Response): Promise<ApiError> {
  const errorText = await response.text();
  const message = parseErrorMessage(errorText) || response.statusText;
  return new ApiError(response.status, message || response.statusText);
}

function parseErrorMessage(errorText: string) {
  if (!errorText) return "";
  try {
    const parsed = JSON.parse(errorText);
    if (parsed && typeof parsed.message === "string") {
      return parsed.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return errorText;
}

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function isAuthPath(path: string) {
  return path.startsWith("/auth");
}

