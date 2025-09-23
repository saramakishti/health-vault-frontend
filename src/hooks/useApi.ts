import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type {
  AuthResponse,
  AuthTokens,
  LoginPayload,
  LogoutResponse,
  RefreshPayload,
  SignupPayload,
} from "../types/auth";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://127.0.0.1:8000";

const PATHS = {
  login: "/authentication/knock/knock/",
  signup: "/authentication/signup/",
  logout: "/authentication/logout/",
  refresh: "/authentication/refresh/",
};

/* ---------- Utilities ---------- */
function getStoredTokens(): AuthTokens | null {
  const raw = localStorage.getItem("tokens");
  return raw ? (JSON.parse(raw) as AuthTokens) : null;
}
function storeTokens(tokens: AuthTokens | null) {
  if (tokens) localStorage.setItem("tokens", JSON.stringify(tokens));
  else localStorage.removeItem("tokens");
}
function extractErr(err: unknown): string {
  const e = err as AxiosError<any>;
  const data = e.response?.data as any;
  if (data) {
    if (typeof data.detail === "string") return data.detail;
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0])
      return String(data.non_field_errors[0]);
    for (const k of Object.keys(data)) {
      const v = data[k];
      if (Array.isArray(v) && v.length && typeof v[0] === "string") return `${k}: ${v[0]}`;
    }
  }
  return e.message || "Request failed";
}

/* ---------- Hook ---------- */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tokens, setTokensState] = useState<AuthTokens | null>(getStoredTokens);
  const apiRef = useRef<AxiosInstance>(null);

  // init axios instance once
  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: API_BASE_URL,
      headers: { "Content-Type": "application/json" },
      withCredentials: false,
    });
  }
  const api = apiRef.current;

  useEffect(() => {
    if (!api) return;
    const access = (tokens as any)?.access ?? (tokens as any)?.token;
    if (access) api.defaults.headers.common.Authorization = `Bearer ${access}`;
    else delete api.defaults.headers.common.Authorization;
    storeTokens(tokens);
  }, [tokens, api]);

  const refreshing = useRef<Promise<string | null> | null>(null);

  const refreshAccess = useCallback(async (): Promise<string | null> => {
    const refresh = (tokens as any)?.refresh;
    if (!refresh) return null;
    if (!refreshing.current) {
      refreshing.current = (async () => {
        try {
          const { data } = await api.post<AuthTokens>(PATHS.refresh, { refresh } as RefreshPayload);
          const next: AuthTokens =
            "access" in data || "refresh" in data ? data : (data as AuthTokens);
          setTokensState((prev) => {
            const merged = { ...(prev ?? {}), ...next } as AuthTokens;
            return merged;
          });
          return (next as any).access ?? (next as any).token ?? null;
        } catch {
          setTokensState(null);
          return null;
        } finally {
          refreshing.current = null;
        }
      })();
    }
    return refreshing.current;
  }, [api, tokens]);

  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config as AxiosRequestConfig & { _retry?: boolean };
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true;
          const newAccess = await refreshAccess();
          if (newAccess) {
            original.headers = {
              ...(original.headers || {}),
              Authorization: `Bearer ${newAccess}`,
            };
            return api(original);
          }
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [api, refreshAccess]);

  /* ----- Public setters ----- */
  const setTokens = useCallback((t: AuthTokens | null) => setTokensState(t), []);
  const clearAuth = useCallback(() => setTokensState(null), []);

  /* ----- Core request helpers (typed, with loading/error) ----- */
  const run = useCallback(
    async <T>(p: Promise<T>): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        const data = await p;
        return data;
      } catch (err) {
        const msg = extractErr(err);
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const get = useCallback(
    async <T>(url: string, config?: AxiosRequestConfig) => run<T>(api.get(url, config).then(r => r.data)),
    [api, run]
  );
  const post = useCallback(
    async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      run<T>(api.post(url, body, config).then(r => r.data)),
    [api, run]
  );
  const put = useCallback(
    async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      run<T>(api.put(url, body, config).then(r => r.data)),
    [api, run]
  );
  const patch = useCallback(
    async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
      run<T>(api.patch(url, body, config).then(r => r.data)),
    [api, run]
  );
  const del = useCallback(
    async <T>(url: string, config?: AxiosRequestConfig) =>
      run<T>(api.delete(url, config).then(r => r.data)),
    [api, run]
  );

  /* ----- Auth convenience (login/signup/logout) ----- */
  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthResponse> => {
      const data = await post<AuthResponse>(PATHS.login, payload);
      const nextTokens: AuthTokens =
        ("access" in data || "refresh" in data) ? data : { token: (data as any).token };
      setTokens(nextTokens);
      return data;
    },
    [post, setTokens]
  );

  const signup = useCallback(
    async (payload: SignupPayload): Promise<AuthResponse> => {
      const data = await post<AuthResponse>(PATHS.signup, payload);
      const nextTokens: AuthTokens =
        ("access" in data || "refresh" in data) ? data : { token: (data as any).token };
      setTokens(nextTokens);
      return data;
    },
    [post, setTokens]
  );

  const logout = useCallback(
    async (): Promise<LogoutResponse | void> => {
      try {
        const data = await post<LogoutResponse>(PATHS.logout, {});
        clearAuth();
        return data;
      } catch {
        // even if backend fails, clear client state
        clearAuth();
      }
    },
    [post, clearAuth]
  );

  const value = useMemo(
    () => ({
      baseUrl: API_BASE_URL,
      loading,
      error,
      tokens,
      setToken: (accessOrToken: string | null) => {
        if (!accessOrToken) return setTokens(null);
        // keep existing refresh if any
        const hasAccess = (tokens as any)?.access ?? null;
        const hasRefresh = (tokens as any)?.refresh ?? null;
        setTokens(
          hasAccess !== null || hasRefresh !== null
            ? ({ access: accessOrToken, refresh: hasRefresh ?? undefined } as AuthTokens)
            : ({ token: accessOrToken } as AuthTokens)
        );
      },
      setTokens,
      clearAuth,
      // generic verbs
      get,
      post,
      put,
      patch,
      del,
      // auth
      login,
      signup,
      logout,
    }),
    [loading, error, tokens, get, post, put, patch, del, login, signup, logout, setTokens, clearAuth]
  );

  return value;
}

export type UseApiReturn = ReturnType<typeof useApi>;
