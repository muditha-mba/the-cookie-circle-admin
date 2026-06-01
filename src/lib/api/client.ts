import { env } from "@/config/env";
import {
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  setStoredTokens,
} from "@/lib/auth/token-storage";
import type { ApiError, ApiErrorBody, TokenResponse } from "@/lib/api/types";

export type ApiClientOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
};

function buildUrl(
  path: string,
  params?: RequestOptions["params"],
  baseUrl = env.apiUrl,
): string {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function parseErrorBody(response: Response): Promise<ApiErrorBody | undefined> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(body: ApiErrorBody | undefined, fallback: string): string {
  if (!body) {
    return fallback;
  }

  if (typeof body.detail === "string") {
    return body.detail;
  }

  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return body.detail.map((item) => item.msg).join(", ");
  }

  return body.message ?? fallback;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(baseUrl: string): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(buildUrl("/api/v1/auth/refresh", undefined, baseUrl), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return false;
  }

  const data = (await response.json()) as TokenResponse;
  setStoredTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });
  return true;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: HeadersInit;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? env.apiUrl;
    this.defaultHeaders = {
      Accept: "application/json",
      ...options.headers,
    };
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, skipAuth = false, ...init } = options;

    const execute = async (): Promise<Response> => {
      const accessToken = skipAuth ? null : getAccessToken();

      return fetch(buildUrl(path, params, this.baseUrl), {
        ...init,
        headers: {
          ...this.defaultHeaders,
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    };

    let response = await execute();

    if (response.status === 401 && !skipAuth && !path.includes("/auth/refresh")) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken(this.baseUrl).finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        response = await execute();
      }
    }

    if (!response.ok) {
      const errorBody = await parseErrorBody(response);
      const error: ApiError = {
        status: response.status,
        message: extractErrorMessage(
          errorBody,
          `Request failed with status ${response.status}`,
        ),
        body: errorBody,
      };
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
