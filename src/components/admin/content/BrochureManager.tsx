import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { apiDownload, isApiError as isApiErrorFn } from "@/lib/api";
import { useContentMutations } from "@/hooks/useContentMutations";

export function BrochureManager() {
  const { uploadBrochure, deleteBrochure, loading, error } = useContentMutations();
  const [status, setStatus] = useState<"unknown" | "available" | "missing">("unknown");
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshStatus = () => {
    setStatus("unknown");
    fetch("/api/public/folleto", { method: "HEAD" })
      .then((r) => setStatus(r.ok ? "available" : "missing"))
      .catch(() => setStatus("missing"));
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Solo se aceptan archivos PDF");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo excede el tamaño máximo permitido de 10MB");
      e.target.value = "";
      return;
    }
    const res = await uploadBrochure(file);
    if (res) {
      toast.success("Folleto cargado");
      refreshStatus();
    } else {
      toast.error(error?.message ?? "No se pudo cargar el folleto");
    }
    e.target.value = "";
  };

  const handleDelete = async () => {
    const res = await deleteBrochure();
    if (res) {
      toast.success("Folleto eliminado");
      refreshStatus();
    } else {
      toast.error(error?.message ?? "No se pudo eliminar");
    }
  };

  const handleDownload = async () => {
    try {
      const { blob, filename } = await apiDownload("/api/public/folleto");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? "Folleto_Laboratorio_XYZ.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      if (isApiErrorFn(e) && e.status === 404) {
        toast.error("El folleto no está disponible");
      } else {
        toast.error("No se pudo descargar el folleto");
      }
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6">
        <div className="flex items-center gap-2">
          <Icon name="picture_as_pdf" size="md" className="text-error" />
          <h3 className="text-heading-md">Folleto PDF</h3>
        </div>
        {status === "unknown" ? (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        ) : status === "available" ? (
          <div className="mt-3 space-y-3">
            <p className="font-body-sm text-on-surface-variant">
              Hay un folleto cargado. La opción "Descargar Folleto" del
              sitio público está habilitada.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleDownload}>
                <Icon name="download" size="sm" /> Descargar actual
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={loading}
              >
                <Icon name="delete" size="sm" /> Eliminar folleto
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="font-body-sm text-on-surface-variant">
              No hay folleto cargado. Sube un PDF (≤ 10MB) para activar
              la descarga en el sitio público.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFile}
              className="block w-full text-body-sm text-on-surface file:mr-3 file:rounded-md file:border file:border-outline file:bg-surface-container-low file:px-3 file:py-1.5 file:text-body-sm file:font-semibold file:text-primary hover:file:bg-primary-container/20"
            />
          </div>
        )}
        {error ? (
          <Alert tone="error" title="Error" className="mt-3">
            {error.message}
          </Alert>
        ) : null}
      </div>
    </section>
  );
}
