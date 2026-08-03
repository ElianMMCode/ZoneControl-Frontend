import type { ApiError } from "@/types";
import { fileNameFromContentDisposition } from "./format";

class ApiErrorImpl extends Error implements ApiError {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(status: number, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiErrorImpl;
}

type Json = unknown;
type Query = Record<string, string | number | boolean | undefined | null>;

let tokenGetter: (() => string | null) | null = null;

export function setAuthTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

function buildUrl(path: string, query?: Query): string {
  const base = path.startsWith("/") ? path : `/${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

function buildHeaders(extra?: HeadersInit, body?: BodyInit | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(extra as Record<string, string> | undefined),
  };
  const isForm = body instanceof FormData;
  if (body && !isForm && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }
  const token = tokenGetter?.();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Error ${response.status}`;
  let fieldErrors: Record<string, string> | undefined;
  try {
    const body = (await response.json()) as Json;
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const obj = body as Record<string, unknown>;
      if (typeof obj.error === "string") message = obj.error;
      if (obj.errors && typeof obj.errors === "object") {
        fieldErrors = obj.errors as Record<string, string>;
      }
    }
  } catch {
    // ignore
  }
  return new ApiErrorImpl(response.status, message, fieldErrors);
}

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Json | FormData | BodyInit;
  query?: Query;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = buildUrl(path, opts.query);
  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: buildHeaders(opts.headers, opts.body as BodyInit | null | undefined),
    signal: opts.signal,
  };
  if (opts.body !== undefined) {
    init.body = opts.body instanceof FormData
      ? opts.body
      : typeof opts.body === "string"
        ? opts.body
        : JSON.stringify(opts.body);
  }
  const res = await fetch(url, init);
  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("Content-Type") ?? "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export async function apiDownload(
  path: string,
  opts: Omit<ApiOptions, "body"> & { body?: Json | BodyInit },
): Promise<{ blob: Blob; filename: string | null }> {
  const url = buildUrl(path, opts.query);
  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: buildHeaders(opts.headers, opts.body as BodyInit | null | undefined),
    signal: opts.signal,
  };
  if (opts.body !== undefined) {
    init.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }
  const res = await fetch(url, init);
  if (!res.ok) throw await parseError(res);
  const blob = await res.blob();
  const filename = fileNameFromContentDisposition(res.headers.get("Content-Disposition"));
  return { blob, filename };
}
