import { useCallback, useEffect, useState } from "react";
import { isApiError, apiFetch } from "@/lib/api";
import type { ApiError } from "@/types";

export type ResourceState<T> = {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refresh: () => void;
};

export function useResource<T>(
  path: string | null,
  query?: Record<string, unknown>,
  deps: ReadonlyArray<unknown> = [],
): ResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(path));
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<T>(path, { query: query as never, signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        if (isApiError(e)) setError(e);
        else setError({ name: "Unknown", message: String(e), status: 0 } as ApiError);
        setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, tick, ...deps]);

  return { data, loading, error, refresh };
}
