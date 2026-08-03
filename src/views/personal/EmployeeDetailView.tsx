import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/common/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { useResource } from "@/hooks/useResource";
import { isApiError } from "@/lib/api";
import {
  useEmployeeAccessHistory,
  useEmployeeMutations,
  useEmployeePermissions,
} from "@/hooks/useGestor";
import {
  CONTRACT_TYPE_LABELS,
  WORK_SHIFT_LABELS,
} from "@/types";
import type {
  AccessHistoryRecord,
  EmployeeSearchResponse,
  PermissionResponse,
} from "@/types";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" });
}

function formatDateTime(value: string) {
  const d = new Date(value);
  return d.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EmployeeDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoTick, setPhotoTick] = useState(0);

  const employee = useResource<EmployeeSearchResponse>(id ? `/api/personal/${id}` : null, undefined, [id]);
  const permissions = useEmployeePermissions(id ?? null);
  const history = useEmployeeAccessHistory(id ?? null, 20);
  const { uploadPhoto, deletePhoto } = useEmployeeMutations();

  const photoUrl = employee.data?.photoUrl
    ? `${employee.data.photoUrl}?t=${photoTick}`
    : `/api/personal/${id}/photo?t=${photoTick}`;

  const onPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadPhoto(id, file);
      setPhotoTick((t) => t + 1);
      employee.refresh();
      toast.success("Foto actualizada");
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo subir la foto");
    }
  };

  const onDeletePhoto = async () => {
    if (!id) return;
    try {
      await deletePhoto(id);
      setPhotoTick((t) => t + 1);
      employee.refresh();
      toast.success("Foto eliminada");
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo eliminar la foto");
    }
  };

  if (employee.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (employee.error) {
    return <ErrorState message={employee.error.message} onRetry={employee.refresh} />;
  }

  if (!employee.data) {
    return <EmptyState title="Empleado no encontrado" icon="person_off" />;
  }

  const e = employee.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${e.firstName} ${e.lastName}`}
        subtitle={`${e.employeeCode} · ${e.position}`}
        actions={
          <Button variant="secondary" onClick={() => navigate("/personal")}>
            <Icon name="arrow_back" size="sm" /> Volver al listado
          </Button>
        }
      />

      <section className="card">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex flex-col items-center gap-2">
            <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-surface-container-highest ring-1 ring-outline-variant">
              <img
                src={photoUrl}
                alt={`Foto de ${e.firstName}`}
                className="h-full w-full object-cover"
                onError={(ev) => {
                  (ev.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onPhotoChange}
              className="hidden"
            />
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                <Icon name="add_a_photo" size="sm" /> {e.photoUrl ? "Cambiar" : "Subir"}
              </Button>
              {e.photoUrl && (
                <Button size="sm" variant="ghost" onClick={onDeletePhoto}>
                  <Icon name="delete" size="sm" />
                </Button>
              )}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Documento" value={`${e.documentType} ${e.documentNumber}`} />
            <Field label="Estado" value={<StatusPill status={e.status} />} />
            <Field label="Cargo" value={e.position} />
            <Field label="Departamento" value={e.departmentName} />
            <Field label="Email" value={e.email ?? "—"} />
            <Field
              label="Rol de sistema"
              value={e.systemRole ?? "—"}
            />
            <Field
              label="Tipo de contrato"
              value={e.contractType ? CONTRACT_TYPE_LABELS[e.contractType] : "—"}
            />
            <Field label="Ubicación base" value={e.baseOfficeName ?? "—"} />
            <Field
              label="Horario / turno"
              value={e.workShift ? WORK_SHIFT_LABELS[e.workShift] : "—"}
            />
            <Field label="Fecha de ingreso" value={formatDate(e.hireDate)} />
            <Field label="Fin de contrato" value={formatDate(e.contractEndDate)} />
            <Field label="Vigencia" value={formatDate(e.hireDate) + " → " + formatDate(e.contractEndDate)} />
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <h3 className="heading-sm text-on-surface">Permisos del Empleado</h3>
        {permissions.loading ? (
          <Skeleton className="h-10 w-full" />
        ) : permissions.error ? (
          <ErrorState message={permissions.error.message} onRetry={permissions.refresh} />
        ) : !permissions.data || permissions.data.length === 0 ? (
          <EmptyState
            title="Sin permisos asignados"
            description="Este empleado aún no tiene permisos de área."
            icon="lock_open"
          />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {permissions.data.map((p: PermissionResponse) => (
              <li key={p.id} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-4 sm:items-center">
                <div>
                  <p className="label-caps">Área</p>
                  <p className="text-body-md">{p.areaName}</p>
                </div>
                <div>
                  <p className="label-caps">Horario</p>
                  <p className="text-body-md font-mono">
                    {p.startTime.slice(0, 5)} – {p.endTime.slice(0, 5)}
                  </p>
                </div>
                <div>
                  <p className="label-caps">Vigencia</p>
                  <p className="text-body-md">
                    {formatDate(p.startDate)} → {formatDate(p.expirationDate)}
                  </p>
                </div>
                <div>
                  <p className="label-caps">Estado</p>
                  <StatusPill status={p.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3">
        <h3 className="heading-sm text-on-surface">Historial de accesos</h3>
        {history.loading ? (
          <Skeleton className="h-10 w-full" />
        ) : history.error ? (
          <ErrorState message={history.error.message} onRetry={history.refresh} />
        ) : !history.data || history.data.length === 0 ? (
          <EmptyState
            title="Sin movimientos"
            description="No se registran accesos para este empleado."
            icon="history"
          />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {history.data.map((h: AccessHistoryRecord) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div className="flex items-center gap-2">
                  <StatusPill status={h.result} />
                  <span className="text-body-md">{h.productionAreaName ?? "—"}</span>
                </div>
                <span className="text-body-sm text-on-surface-variant">{formatDateTime(h.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="label-caps">{label}</p>
      <div className="text-body-md text-on-surface">{value}</div>
    </div>
  );
}
