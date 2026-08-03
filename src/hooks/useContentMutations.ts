import { useCallback, useState } from "react";
import { apiFetch, isApiError } from "@/lib/api";
import type {
  ApiError,
  OfficeRequest,
  ProductRequest,
} from "@/types";

type ContentSection = "INSTITUTIONAL" | "CONTACT" | "LOCATIONS";

export function useContentMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateSection = useCallback(
    async (section: ContentSection, content: Record<string, string>) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<{ message: string }>(
          `/api/admin/contenido-publico/${section}`,
          { method: "PUT", body: content },
        );
        return res;
      } catch (e) {
        if (isApiError(e)) setError(e);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createOffice = useCallback(async (body: OfficeRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string; name: string }>(
        "/api/admin/contenido-publico/sedes",
        { method: "POST", body },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOffice = useCallback(async (id: string, body: OfficeRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string; name: string }>(
        `/api/admin/contenido-publico/sedes/${id}`,
        { method: "PUT", body },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOffice = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(
        `/api/admin/contenido-publico/sedes/${id}`,
        { method: "DELETE" },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createProduct = useCallback(async (body: ProductRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string; name: string }>(
        "/api/admin/contenido-publico/productos",
        { method: "POST", body },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, body: ProductRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ id: string; name: string }>(
        `/api/admin/contenido-publico/productos/${id}`,
        { method: "PUT", body },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(
        `/api/admin/contenido-publico/productos/${id}`,
        { method: "DELETE" },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBrochure = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiFetch<{ message: string }>(
        "/api/admin/contenido-publico/folleto",
        { method: "POST", body: fd },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBrochure = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(
        "/api/admin/contenido-publico/folleto",
        { method: "DELETE" },
      );
      return res;
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateSection,
    createOffice,
    updateOffice,
    deleteOffice,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadBrochure,
    deleteBrochure,
    loading,
    error,
  };
}
