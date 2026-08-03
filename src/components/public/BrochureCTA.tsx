import { useState } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiDownload, isApiError } from "@/lib/api";
import type { BrochureStatus } from "@/hooks/usePublicData";

export function BrochureCTA({ status }: { status: BrochureStatus }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
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
      if (isApiError(e) && e.status === 404) {
        toast.error("El folleto aún no está disponible");
      } else {
        toast.error("No se pudo descargar el folleto");
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="bg-public-primary text-public-on-primary">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-4 px-6 py-12 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-public-primary-container/30">
            <Icon name="description" size="lg" />
          </span>
          <div>
            <h2 className="text-heading-md">Descarga nuestro folleto informativo</h2>
            <p className="text-body-sm opacity-90">
              Conoce nuestro portafolio completo en un solo PDF.
            </p>
          </div>
        </div>
        {status === "available" ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex h-12 items-center gap-2 rounded-md bg-surface-container-lowest px-6 text-body-md font-semibold text-public-primary hover:bg-public-primary-container/10 disabled:opacity-60"
          >
            {downloading ? <Skeleton className="h-4 w-4 rounded-full" /> : <Icon name="download" size="sm" />}
            Descargar Folleto (PDF)
          </button>
        ) : status === "missing" ? (
          <span className="inline-flex h-12 items-center gap-2 rounded-md border border-public-on-primary/40 px-6 text-body-md">
            <Icon name="hourglass_empty" size="sm" /> Próximamente
          </span>
        ) : (
          <Skeleton className="h-12 w-56 rounded-md" />
        )}
      </div>
    </section>
  );
}
