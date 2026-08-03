import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatCard } from "@/components/common/StatCard";
import { isApiError, apiDownload } from "@/lib/api";
import { useBulkUpload } from "@/hooks/useGestor";
import type { BulkUploadResult } from "@/types";

export function BulkUploadView() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload } = useBulkUpload();

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setResult(null);
  };

  const onDownloadTemplate = async () => {
    try {
      const { blob, filename } = await apiDownload("/api/personal/bulk/plantilla");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? "plantilla.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("No se pudo descargar la plantilla");
    }
  };

  const onSubmit = async () => {
    if (!file) {
      toast.error("Selecciona un archivo CSV");
      return;
    }
    setSubmitting(true);
    try {
      const res = await upload(file);
      setResult(res);
      if (res.errors === 0) {
        toast.success("Carga completada", {
          description: `${res.successes} empleados registrados`,
        });
      } else {
        toast.warning("Carga con observaciones", {
          description: `${res.successes} ok, ${res.errors} con error`,
        });
      }
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.message);
      } else {
        toast.error("No se pudo procesar el archivo");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDownloadErrorReport = async () => {
    if (!result?.errorReportUrl) return;
    const blob = new Blob([result.errorReportUrl], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_errores_carga.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Carga Masiva de Personal"
        subtitle="Crea múltiples empleados a partir de un archivo CSV"
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <Icon name="arrow_back" size="sm" /> Volver
          </Button>
        }
      />

      <section className="card space-y-4">
        <h3 className="heading-sm text-on-surface">1. Descarga la plantilla</h3>
        <p className="text-body-sm text-on-surface-variant">
          El archivo CSV debe respetar el orden y los encabezados de la plantilla oficial
          (incluye la columna opcional <code>fecha_ingreso</code> en formato YYYY-MM-DD).
        </p>
        <Button variant="secondary" onClick={onDownloadTemplate}>
          <Icon name="download" size="sm" /> Descargar plantilla
        </Button>
      </section>

      <section className="card space-y-4">
        <h3 className="heading-sm text-on-surface">2. Carga el archivo</h3>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,text/csv"
          onChange={onPickFile}
          className="hidden"
        />
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className="grid cursor-pointer place-items-center rounded-md border-2 border-dashed border-outline-variant bg-surface-container-lowest px-4 py-10 text-center transition-colors hover:border-primary"
        >
          <Icon name="cloud_upload" size="lg" className="text-on-surface-variant" />
          <p className="mt-2 text-body-md text-on-surface">
            {file ? file.name : "Haz clic para seleccionar el archivo"}
          </p>
          <p className="text-body-sm text-on-surface-variant">
            Formatos admitidos: .csv, .txt. Máximo 1000 filas.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSubmit} disabled={!file || submitting}>
            <Icon name="upload_file" size="sm" /> Procesar archivo
          </Button>
        </div>
      </section>

      {result && (
        <section className="card space-y-4">
          <h3 className="heading-sm text-on-surface">3. Resumen</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              icon="analytics"
              label="Total"
              value={result.total}
              tone="primary"
            />
            <StatCard
              icon="check_circle"
              label="Registros exitosos"
              value={result.successes}
              tone="secondary"
              progress={{
                percent: result.total ? (result.successes / result.total) * 100 : 0,
                tone: "secondary",
              }}
            />
            <StatCard
              icon="error"
              label="Registros con error"
              value={result.errors}
              tone="error"
              progress={{
                percent: result.total ? (result.errors / result.total) * 100 : 0,
                tone: "error",
              }}
            />
          </div>
          {result.errorReportUrl && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onDownloadErrorReport}>
                <Icon name="download" size="sm" /> Descargar reporte de errores
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
