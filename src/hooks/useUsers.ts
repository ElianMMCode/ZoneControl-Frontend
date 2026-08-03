import { useCallback, useState } from "react";
import { apiFetch, isApiError } from "@/lib/api";
import type { ApiError, CreateUserRequest, Page, Role, StatusUpdateRequest, UpdateUserRequest, UserResponse, UserStatus } from "@/types";

export function useUserMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const create = useCallback(async (body: CreateUserRequest): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string }>("/api/admin/users", { method: "POST", body });
      return res.id;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, body: UpdateUserRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch<unknown>(`/api/admin/users/${id}`, { method: "PUT", body });
      return true;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: UserStatus): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const body: StatusUpdateRequest = { status };
      await apiFetch<unknown>(`/api/admin/users/${id}/status`, { method: "PATCH", body });
      return true;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (id: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      return res.message;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, update, updateStatus, resetPassword, loading, error };
}

export type UserListParams = {
  search?: string;
  role?: Role;
  status?: UserStatus;
  page?: number;
  size?: number;
};

export function userListQuery(p: UserListParams) {
  return {
    search: p.search,
    role: p.role,
    status: p.status,
    page: p.page,
    size: p.size ?? 10,
  };
}

export type { Page, UserResponse };
