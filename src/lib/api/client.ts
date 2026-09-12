const TOKEN_KEY = "m3ad_token";
const REFRESH_KEY = "m3ad_refresh";

export type AppError = {
  code?: string;
  message: string;
  status: number;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  constructor(error: AppError) {
    super(error.message);
    this.status = error.status;
    this.code = error.code;
    this.name = "ApiClientError";
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredTokens(token: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearStoredTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token: string; refreshToken: string };
  setStoredTokens(data.token, data.refreshToken);
  return data.token;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";
  const url = new URL(`${base}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

const ERROR_MAP: Record<string, string> = {
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  ADMIN_ACCESS_BLOCKED: "Admin access is currently blocked.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCESS_DENIED: "You do not have permission to access this resource. Try signing out and back in.",
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers, ...rest } = options;
  let token = getStoredToken();

  const doFetch = async (authToken: string | null) =>
    fetch(buildUrl(path, params), {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch(token);
  if (response.status === 401 && token) {
    const newToken = await refreshToken();
    if (newToken) {
      token = newToken;
      response = await doFetch(newToken);
    } else {
      clearStoredTokens();
    }
  }

  if (!response.ok) {
    let errorBody: AppError = { message: response.statusText, status: response.status };
    try {
      const json = await response.json();
      errorBody = {
        message: ERROR_MAP[json.errorCode] ?? json.message ?? response.statusText,
        status: response.status,
        code: json.errorCode,
      };
    } catch {
      // default
    }
    throw new ApiClientError(errorBody);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type UploadedFileResponse = {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  publicId?: string;
};

export async function apiUploadFile(
  path: string,
  file: File,
  fields?: Record<string, string>,
): Promise<UploadedFileResponse> {
  let token = getStoredToken();
  const formData = new FormData();
  formData.append("file", file);
  if (fields) {
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  }

  const doFetch = async (authToken: string | null) =>
    fetch(buildUrl(path), {
      method: "POST",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: formData,
    });

  let response = await doFetch(token);
  if (response.status === 401 && token) {
    const newToken = await refreshToken();
    if (newToken) {
      token = newToken;
      response = await doFetch(newToken);
    } else {
      clearStoredTokens();
    }
  }

  if (!response.ok) {
    let errorBody: AppError = { message: response.statusText, status: response.status };
    try {
      const json = await response.json();
      errorBody = {
        message: ERROR_MAP[json.errorCode] ?? json.message ?? response.statusText,
        status: response.status,
        code: json.errorCode,
      };
    } catch {
      // default
    }
    throw new ApiClientError(errorBody);
  }

  return response.json() as Promise<UploadedFileResponse>;
}
