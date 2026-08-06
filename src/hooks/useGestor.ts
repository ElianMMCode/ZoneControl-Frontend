import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type {
  BulkUploadResult,
  EmployeeSearchResponse,
  OfficeResponse,
  PermissionResponse,
  Position,
  ProductionArea,
  RegisterEmployeeRequest,
  UpdateEmployeeRequest,
  AccessHistoryRecord,
} from "@/types";

// Re-exported from public.ts to keep call sites terse.
export type { OfficeResponse };

const DEPARTMENTS_PATH = "/api/personal/departamentos";
const OFFICES_PATH = "/api/personal/sedes";
const CARGOS_PATH = "/api/personal/cargos";
const AREAS_PATH = "/api/permisos/areas";
const PERMISSIONS_PATH = "/api/permisos";

export function useDepartments() {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<string[]>(DEPARTMENTS_PATH, { signal: ctrl.signal })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [tick]);
  return { data, loading, error, refresh };
}

export function useCargos() {
  const [data, setData] = useState<Position[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<Position[]>(CARGOS_PATH, { signal: ctrl.signal })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [tick]);

  const create = useCallback(async (name: string, systemRole?: string | null) => {
    const created = await apiFetch<Position>(CARGOS_PATH, {
      method: "POST",
      body: { name, systemRole: systemRole || undefined },
    });
    refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (id: string, name: string, systemRole?: string | null) => {
    const updated = await apiFetch<Position>(`${CARGOS_PATH}/${id}`, {
      method: "PUT",
      body: { name, systemRole: systemRole || undefined },
    });
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await apiFetch<{ message: string }>(`${CARGOS_PATH}/${id}`, { method: "DELETE" });
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, create, update, remove };
}

export function useOffices() {
  const [data, setData] = useState<OfficeResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<OfficeResponse[]>(OFFICES_PATH, { signal: ctrl.signal })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [tick]);
  return { data, loading, error, refresh };
}

export function useEmployeePermissions(employeeId: string | null) {
  const [data, setData] = useState<PermissionResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!employeeId) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<PermissionResponse[]>(`/api/personal/${employeeId}/permisos`, { signal: ctrl.signal })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [employeeId, tick]);

  return { data, loading, error, refresh };
}

export function useEmployeeAccessHistory(employeeId: string | null, limit = 20) {
  const [data, setData] = useState<AccessHistoryRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!employeeId) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<AccessHistoryRecord[]>(`/api/personal/${employeeId}/accesos`, {
      signal: ctrl.signal,
      query: { limit },
    })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [employeeId, limit, tick]);

  return { data, loading, error, refresh };
}

export function useEmployeeMutations() {
  const register = useCallback(async (req: RegisterEmployeeRequest) => {
    return apiFetch<{ id: string; employeeCode: string }>("/api/personal", {
      method: "POST",
      body: req,
    });
  }, []);

  const update = useCallback(async (id: string, req: UpdateEmployeeRequest) => {
    return apiFetch<EmployeeSearchResponse>(`/api/personal/${id}`, {
      method: "PATCH",
      body: req,
    });
  }, []);

  const uploadPhoto = useCallback(async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<EmployeeSearchResponse>(`/api/personal/${id}/photo`, {
      method: "POST",
      body: fd,
    });
  }, []);

  const deletePhoto = useCallback(async (id: string) => {
    return apiFetch<EmployeeSearchResponse>(`/api/personal/${id}/photo`, {
      method: "DELETE",
    });
  }, []);

  return { register, update, uploadPhoto, deletePhoto };
}

export function usePermissionMutations() {
  const create = useCallback(async (req: {
    employeeCode: string;
    productionAreaName: string;
    startDate: string;
    expirationDate: string;
    startTime: string;
    endTime: string;
    schedules?: { dayOfWeek: string; startTime: string; endTime: string }[];
  }) => {
    return apiFetch<PermissionResponse>(PERMISSIONS_PATH, {
      method: "POST",
      body: req,
    });
  }, []);

  const suspend = useCallback(async (id: string, reactivationDate: string) => {
    return apiFetch<PermissionResponse>(`${PERMISSIONS_PATH}/${id}/suspend`, {
      method: "PATCH",
      body: { reactivationDate },
    });
  }, []);

  const reactivate = useCallback(async (id: string) => {
    return apiFetch<PermissionResponse>(`${PERMISSIONS_PATH}/${id}/reactivate`, {
      method: "PATCH",
    });
  }, []);

  const revoke = useCallback(async (id: string) => {
    return apiFetch<{ message: string }>(`${PERMISSIONS_PATH}/${id}`, {
      method: "DELETE",
    });
  }, []);

  const update = useCallback(async (id: string, req: {
    startDate?: string;
    expirationDate?: string;
    startTime?: string;
    endTime?: string;
    schedules?: { dayOfWeek: string; startTime: string; endTime: string }[];
  }) => {
    return apiFetch<PermissionResponse>(`${PERMISSIONS_PATH}/${id}`, {
      method: "PATCH",
      body: req,
    });
  }, []);

  return { create, suspend, reactivate, revoke, update };
}

export function useAreas() {
  const [data, setData] = useState<ProductionArea[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<ProductionArea[]>(AREAS_PATH, { signal: ctrl.signal })
      .then((res) => setData(res))
      .catch((e) => {
        if ((e as { name?: string })?.name !== "AbortError") setError(e as Error);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [tick]);

  const create = useCallback(async (name: string, description?: string) => {
    const created = await apiFetch<ProductionArea>(AREAS_PATH, {
      method: "POST",
      body: { name, description: description ?? "" },
    });
    refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (id: string, name: string, description?: string) => {
    const updated = await apiFetch<ProductionArea>(`${AREAS_PATH}/${id}`, {
      method: "PUT",
      body: { name, description: description ?? "" },
    });
    refresh();
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await apiFetch<{ message: string }>(`${AREAS_PATH}/${id}`, { method: "DELETE" });
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, create, update, remove };
}

export function useBulkUpload() {
  const upload = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<BulkUploadResult>("/api/personal/bulk", {
      method: "POST",
      body: fd,
    });
  }, []);
  return { upload };
}
