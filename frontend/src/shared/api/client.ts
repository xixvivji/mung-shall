const API_BASE = "/api";
const ACCESS_TOKEN_KEY = "accessToken";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

type ApiOptions = RequestInit & {
  skipAuth?: boolean;
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
  const { skipAuth, credentials, ...init } = options;
  const headers = new Headers(init.headers);
  const hasBody = init.body !== undefined;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

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
