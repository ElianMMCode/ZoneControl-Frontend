import { useCallback, useState } from "react";
import { apiFetch, isApiError } from "@/lib/api";
import type {
  ApiError,
  CatalogResponse,
  CategoryRequest,
  CategoryResponse,
  OfficeRequest,
  OfficeResponse,
  ProductRequest,
} from "@/types";

type ContentSection = "INSTITUTIONAL" | "CONTACT";

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

  const createCategory = useCallback(async (body: CategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<CategoryResponse>(
        "/api/admin/contenido-publico/categorias",
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

  const updateCategory = useCallback(async (id: string, body: CategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<CategoryResponse>(
        `/api/admin/contenido-publico/categorias/${id}`,
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

  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string }>(
        `/api/admin/contenido-publico/categorias/${id}`,
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

  const uploadProductImage = useCallback(async (id: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      return await apiFetch<CatalogResponse>(
        `/api/admin/contenido-publico/productos/${id}/imagen`,
        { method: "POST", body: fd },
      );
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProductImage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch<CatalogResponse>(
        `/api/admin/contenido-publico/productos/${id}/imagen`,
        { method: "DELETE" },
      );
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadOfficeImage = useCallback(async (id: string, file: File) => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      return await apiFetch<OfficeResponse>(
        `/api/admin/contenido-publico/sedes/${id}/imagen`,
        { method: "POST", body: fd },
      );
    } catch (e) {
      if (isApiError(e)) setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOfficeImage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFetch<OfficeResponse>(
        `/api/admin/contenido-publico/sedes/${id}/imagen`,
        { method: "DELETE" },
      );
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
    uploadOfficeImage,
    deleteOfficeImage,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadBrochure,
    deleteBrochure,
    loading,
    error,
  };
}
