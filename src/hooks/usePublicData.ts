import { useEffect, useState } from "react";
import { apiFetch, isApiError } from "@/lib/api";
import type {
  ApiError,
  CatalogResponse,
  ContactResponse,
  InstitutionalResponse,
  OfficeResponse,
} from "@/types";

const PUBLIC_INSTITUTIONAL = "/api/public/institucional";
const PUBLIC_CONTACTO = "/api/public/contacto";
const PUBLIC_SEDES = "/api/public/sedes";
const PUBLIC_CATALOGO = "/api/public/catalogo";
const PUBLIC_FOLLETO = "/api/public/folleto";

export type BrochureStatus = "unknown" | "available" | "missing";

function useJsonResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<T>(path, { signal: controller.signal })
      .then((res) => setData(res))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(isApiError(e) ? e : null);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [path, tick]);

  return {
    data,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}

export function usePublicData() {
  const institutional = useJsonResource<InstitutionalResponse>(PUBLIC_INSTITUTIONAL);
  const contact = useJsonResource<ContactResponse>(PUBLIC_CONTACTO);
  const sedes = useJsonResource<OfficeResponse[]>(PUBLIC_SEDES);
  const catalogo = useJsonResource<CatalogResponse[]>(PUBLIC_CATALOGO);

  const [brochure, setBrochure] = useState<BrochureStatus>("unknown");

  useEffect(() => {
    let cancelled = false;
    fetch(PUBLIC_FOLLETO, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setBrochure(res.ok ? "available" : "missing");
      })
      .catch(() => {
        if (!cancelled) setBrochure("missing");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => {
    institutional.refresh();
    contact.refresh();
    sedes.refresh();
    catalogo.refresh();
    setBrochure("unknown");
    fetch(PUBLIC_FOLLETO, { method: "HEAD" })
      .then((res) => setBrochure(res.ok ? "available" : "missing"))
      .catch(() => setBrochure("missing"));
  };

  const loading =
    institutional.loading ||
    contact.loading ||
    sedes.loading ||
    catalogo.loading ||
    brochure === "unknown";
  const error =
    institutional.error?.message ??
    contact.error?.message ??
    sedes.error?.message ??
    catalogo.error?.message ??
    null;

  return {
    institutional: institutional.data,
    contact: contact.data,
    sedes: sedes.data ?? [],
    catalogo: catalogo.data ?? [],
    brochure,
    loading,
    error,
    refresh,
  };
}
