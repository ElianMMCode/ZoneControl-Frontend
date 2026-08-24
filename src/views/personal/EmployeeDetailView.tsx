import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { StatusPill } from "@/components/common/StatusPill";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { useResource } from "@/hooks/useResource";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, isApiError } from "@/lib/api";
import {
  useAreas,
  useCargos,
  useDepartments,
  useEmployeeAccessHistory,
  useEmployeeMutations,
  useEmployeePermissions,
  useOffices,
  usePermissionMutations,
} from "@/hooks/useGestor";
import { PermissionFormModal, type PermissionFormValues } from "@/components/domain/PermissionFormModal";
import {
  CONTRACT_TYPE_LABELS,
  WORK_SHIFT_LABELS,
} from "@/types";
import type {
  AccessHistoryRecord,
  ContractType,
  DocumentType,
  EmployeeSearchResponse,
  EmployeeStatus,
  PermissionResponse,
  WorkShift,
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
  const [editing, setEditing] = useState(false);
  const [assigningArea, setAssigningArea] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionResponse | null>(null);
  const [revoking, setRevoking] = useState<PermissionResponse | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<PermissionResponse | null>(null);
  const [reactivationDate, setReactivationDate] = useState("");
  const [showFullHistory, setShowFullHistory] = useState(false);

  const employee = useResource<EmployeeSearchResponse>(id ? `/api/personal/${id}` : null, undefined, [id]);
  const permissions = useEmployeePermissions(id ?? null);
  const history = useEmployeeAccessHistory(id ?? null, 20);
  const { uploadPhoto, deletePhoto, update } = useEmployeeMutations();
  const { token } = useAuth();
  const {
    create: createPermission,
    update: updatePermission,
    revoke: revokePermission,
    suspend: suspendPermission,
    reactivate: reactivatePermission,
  } = usePermissionMutations();
  const areas = useAreas();

  // <img> no puede enviar headers; siempre se sirve por la API con el
  // token como query param (soportado por el backend solo para este endpoint).
  const photoSrc = id
    ? `/api/personal/${id}/photo?t=${photoTick}&token=${encodeURIComponent(token ?? "")}`
    : null;

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

  const onSaveEmployee = async (values: ReturnType<typeof toUpdateRequest>) => {
    if (!id) return false;
    try {
      await update(id, values);
      toast.success("Empleado actualizado");
      employee.refresh();
      permissions.refresh();
      setEditing(false);
      return true;
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo actualizar el empleado");
      return false;
    }
  };

  const onAssignArea = async (values: PermissionFormValues) => {
    if (!employee.data) return false;
    try {
      await createPermission({
        employeeCode: employee.data.employeeCode,
        productionAreaName: values.productionAreaName,
        startDate: values.startDate,
        expirationDate: values.expirationDate,
        startTime: values.startTime,
        endTime: values.endTime,
        schedules: values.schedules,
      });
      toast.success("Permiso otorgado");
      permissions.refresh();
      return true;
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo otorgar el permiso");
      return false;
    }
  };

  const onEditPermission = async (values: PermissionFormValues) => {
    if (!editingPermission) return false;
    try {
      await updatePermission(editingPermission.id, {
        startDate: values.startDate,
        expirationDate: values.expirationDate,
        startTime: values.startTime,
        endTime: values.endTime,
        schedules: values.schedules,
      });
      toast.success("Permiso actualizado");
      permissions.refresh();
      return true;
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo actualizar el permiso");
      return false;
    }
  };

  const onRevoke = async () => {
    if (!revoking) return;
    try {
      await revokePermission(revoking.id);
      toast.success("Permiso revocado");
      setRevoking(null);
      permissions.refresh();
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo revocar el permiso");
    }
  };

  const onSuspendPermission = async () => {
    if (!suspendTarget || !reactivationDate) {
      toast.error("Selecciona la fecha de reactivación");
      return;
    }
    try {
      await suspendPermission(suspendTarget.id, reactivationDate);
      toast.success("Permiso suspendido");
      setSuspendTarget(null);
      setReactivationDate("");
      permissions.refresh();
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo suspender el permiso");
    }
  };

  const onReactivatePermission = async (permission: PermissionResponse) => {
    try {
      await reactivatePermission(permission.id);
      toast.success("Permiso reactivado");
      permissions.refresh();
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo reactivar el permiso");
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
                src={photoSrc ?? undefined}
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

          {editing ? (
            <EditEmployeeForm
              employee={e}
              onCancel={() => setEditing(false)}
              onSave={onSaveEmployee}
            />
          ) : (
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Documento" value={`${e.documentType} ${e.documentNumber}`} />
              <Field label="Estado" value={<StatusPill status={e.status} />} />
              <Field label="Cargo" value={e.position} />
              <Field label="Departamento" value={e.departmentName} />
              <Field label="Email" value={e.email ?? "—"} />
              <Field label="Rol de sistema" value={e.systemRole ?? "—"} />
              <Field label="Tipo de contrato" value={e.contractType ? CONTRACT_TYPE_LABELS[e.contractType] : "—"} />
              <Field label="Ubicación base" value={e.baseOfficeName ?? "—"} />
              <Field label="Horario / turno" value={e.workShift ? WORK_SHIFT_LABELS[e.workShift] : "—"} />
              <Field label="Fecha de ingreso" value={formatDate(e.hireDate)} />
              <Field label="Fin de contrato" value={formatDate(e.contractEndDate)} />
              <div className="flex items-end">
                <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
                  <Icon name="edit" size="sm" /> Editar información
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card space-y-3">
        <header className="card-header">
          <h3 className="heading-sm text-on-surface">Permisos del Empleado</h3>
          <Button size="sm" onClick={() => setAssigningArea(true)}>
            <Icon name="add" size="sm" /> Asignar nueva área
          </Button>
        </header>
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
              <li key={p.id} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:items-center">
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
                </div>
                <div className="flex items-center gap-1 sm:justify-end">
                  {p.status === "SUSPENDIDO" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onReactivatePermission(p)}
                      title="Reactivar permiso"
                    >
                      <Icon name="lock_open" size="sm" />
                    </Button>
                  )}
                  {p.status === "ACTIVO" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingPermission(p)}
                      title="Editar permiso"
                    >
                      <Icon name="edit" size="sm" />
                    </Button>
                  )}
                  {p.status === "ACTIVO" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSuspendTarget(p);
                        setReactivationDate("");
                      }}
                      title="Suspender permiso"
                    >
                      <Icon name="block" size="sm" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setRevoking(p)} title="Revocar permiso">
                    <Icon name="delete" size="sm" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card space-y-3">
        <header className="card-header">
          <h3 className="heading-sm text-on-surface">Historial de accesos</h3>
          <Button size="sm" variant="secondary" onClick={() => setShowFullHistory(true)}>
            <Icon name="history" size="sm" /> Ver historial completo
          </Button>
        </header>
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

      <PermissionFormModal
        open={assigningArea}
        onClose={() => setAssigningArea(false)}
        onSubmit={onAssignArea}
        areas={areas.data ?? []}
        areasLoading={areas.loading}
        fixedEmployeeCode={e.employeeCode}
      />

      <PermissionFormModal
        open={!!editingPermission}
        onClose={() => setEditingPermission(null)}
        onSubmit={onEditPermission}
        initial={editingPermission}
        areas={areas.data ?? []}
        areasLoading={areas.loading}
      />

      <Modal
        open={suspendTarget !== null}
        onClose={() => setSuspendTarget(null)}
        title="Suspender permiso"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSuspendTarget(null)}>Cancelar</Button>
            <Button onClick={onSuspendPermission}><Icon name="block" size="sm" /> Suspender</Button>
          </>
        }
      >
        <p className="text-body-md">
          Vas a suspender el permiso de <b>{suspendTarget?.employeeName}</b> para el área <b>{suspendTarget?.areaName}</b>.
        </p>
        <FormField id="reactivationDate" label="Fecha de reactivación" required>
          <input
            id="reactivationDate"
            type="date"
            className="input"
            value={reactivationDate}
            onChange={(e) => setReactivationDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
          />
        </FormField>
      </Modal>

      <ConfirmDialog
        open={!!revoking}
        title="Revocar permiso"
        message={
          revoking
            ? `¿Seguro que deseas revocar el permiso de ${revoking.employeeName} para el área ${revoking.areaName}? Esta acción es permanente.`
            : ""
        }
        confirmLabel="Revocar"
        tone="danger"
        onCancel={() => setRevoking(null)}
        onConfirm={onRevoke}
      />

      <FullHistoryModal
        open={showFullHistory}
        onClose={() => setShowFullHistory(false)}
        employeeId={id ?? null}
        employeeName={`${e.firstName} ${e.lastName}`}
      />
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

function toUpdateRequest(form: EditFormValues) {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    cargoId: form.cargoId || undefined,
    email: form.email || undefined,
    documentType: form.documentType,
    documentNumber: form.documentNumber,
    departmentName: form.departmentName,
    status: form.status,
    contractType: (form.contractType || undefined) as ContractType | undefined,
    baseOfficeName: form.baseOfficeName || undefined,
    workShift: (form.workShift || undefined) as WorkShift | undefined,
    hireDate: form.hireDate || undefined,
    contractEndDate: form.contractEndDate || undefined,
  };
}

type EditFormValues = {
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  cargoId: string;
  departmentName: string;
  email: string;
  status: EmployeeStatus;
  contractType: string;
  baseOfficeName: string;
  workShift: string;
  hireDate: string;
  contractEndDate: string;
};

function EditEmployeeForm({
  employee,
  onCancel,
  onSave,
}: {
  employee: EmployeeSearchResponse;
  onCancel: () => void;
  onSave: (values: ReturnType<typeof toUpdateRequest>) => Promise<boolean>;
}) {
  const departments = useDepartments();
  const offices = useOffices();
  const cargos = useCargos();
  const [form, setForm] = useState<EditFormValues>({
    documentType: employee.documentType,
    documentNumber: employee.documentNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    cargoId: employee.cargoId ?? "",
    departmentName: employee.departmentName,
    email: employee.email ?? "",
    status: employee.status,
    contractType: employee.contractType ?? "",
    baseOfficeName: employee.baseOfficeName ?? "",
    workShift: employee.workShift ?? "",
    hireDate: employee.hireDate ?? "",
    contractEndDate: employee.contractEndDate ?? "",
  });
  const [saving, setSaving] = useState(false);

  const onChange = <K extends keyof EditFormValues>(key: K, value: EditFormValues[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(toUpdateRequest(form));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex-1 space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField id="edit-docType" label="Tipo documento" required>
          <Select id="edit-docType" value={form.documentType} onChange={(e) => onChange("documentType", e.target.value as DocumentType)}>
            <Option value="CC">CC</Option>
            <Option value="CE">CE</Option>
            <Option value="TI">TI</Option>
            <Option value="PA">PA</Option>
            <Option value="RC">RC</Option>
          </Select>
        </FormField>
        <FormField id="edit-docNum" label="Nº documento" required>
          <input id="edit-docNum" className="input" maxLength={20} value={form.documentNumber} onChange={(e) => onChange("documentNumber", e.target.value)} required />
        </FormField>
        <FormField id="edit-firstName" label="Nombres" required>
          <input id="edit-firstName" className="input" maxLength={35} value={form.firstName} onChange={(e) => onChange("firstName", e.target.value)} required />
        </FormField>
        <FormField id="edit-lastName" label="Apellidos" required>
          <input id="edit-lastName" className="input" maxLength={35} value={form.lastName} onChange={(e) => onChange("lastName", e.target.value)} required />
        </FormField>
        <FormField id="edit-cargoId" label="Cargo" required>
          <Select
            id="edit-cargoId"
            value={form.cargoId}
            onChange={(e) => onChange("cargoId", e.target.value)}
            disabled={cargos.loading}
          >
            <Option value="">Seleccione…</Option>
            {cargos.data?.map((c) => (
              <Option key={c.id} value={c.id}>{c.name}</Option>
            ))}
          </Select>
        </FormField>
        <FormField id="edit-email" label="Email">
          <input id="edit-email" type="email" className="input" value={form.email} onChange={(e) => onChange("email", e.target.value)} />
        </FormField>
        <FormField id="edit-dept" label="Departamento" required>
          <Select id="edit-dept" value={form.departmentName} onChange={(e) => onChange("departmentName", e.target.value)} disabled={departments.loading}>
            <Option value="">Seleccione…</Option>
            {departments.data?.map((d) => (
              <Option key={d} value={d}>{d}</Option>
            ))}
          </Select>
        </FormField>
        <FormField id="edit-status" label="Estado" required>
          <Select id="edit-status" value={form.status} onChange={(e) => onChange("status", e.target.value as EmployeeStatus)}>
            <Option value="ACTIVO">Activo</Option>
            <Option value="INACTIVO">Inactivo</Option>
            <Option value="SUSPENDIDO">Suspendido</Option>
          </Select>
        </FormField>
        <FormField id="edit-contractType" label="Tipo de contrato">
          <Select id="edit-contractType" value={form.contractType} onChange={(e) => onChange("contractType", e.target.value)}>
            <Option value="">— Sin definir —</Option>
            {(Object.keys(CONTRACT_TYPE_LABELS) as (keyof typeof CONTRACT_TYPE_LABELS)[]).map((c) => (
              <Option key={c} value={c}>{CONTRACT_TYPE_LABELS[c]}</Option>
            ))}
          </Select>
        </FormField>
        <FormField id="edit-office" label="Ubicación base">
          <Select id="edit-office" value={form.baseOfficeName} onChange={(e) => onChange("baseOfficeName", e.target.value)} disabled={offices.loading}>
            <Option value="">— Sin sede asignada —</Option>
            {offices.data?.map((o) => (
              <Option key={o.id} value={o.name}>{o.name}</Option>
            ))}
          </Select>
        </FormField>
        <FormField id="edit-shift" label="Horario / turno">
          <Select id="edit-shift" value={form.workShift} onChange={(e) => onChange("workShift", e.target.value)}>
            <Option value="">— Sin definir —</Option>
            {(Object.keys(WORK_SHIFT_LABELS) as (keyof typeof WORK_SHIFT_LABELS)[]).map((w) => (
              <Option key={w} value={w}>{WORK_SHIFT_LABELS[w]}</Option>
            ))}
          </Select>
        </FormField>
        <FormField id="edit-hire" label="Fecha de ingreso">
          <input id="edit-hire" type="date" className="input" value={form.hireDate} onChange={(e) => onChange("hireDate", e.target.value)} />
        </FormField>
        <FormField id="edit-end" label="Fin de contrato">
          <input id="edit-end" type="date" className="input" value={form.contractEndDate} onChange={(e) => onChange("contractEndDate", e.target.value)} />
        </FormField>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="submit" loading={saving}>
          <Icon name="save" size="sm" /> Guardar cambios
        </Button>
      </div>
    </form>
  );
}

function FullHistoryModal({
  open,
  onClose,
  employeeId,
  employeeName,
}: {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
  employeeName: string;
}) {
  const [records, setRecords] = useState<AccessHistoryRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !employeeId) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    apiFetch<AccessHistoryRecord[]>(`/api/personal/${employeeId}/accesos`, {
      query: { limit: 200 },
      signal: ctrl.signal,
    })
      .then(setRecords)
      .catch((e) => {
        if ((e as { name?: string })?.name === "AbortError") return;
        if (isApiError(e)) setError(e.message);
        else setError("No se pudo cargar el historial");
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [open, employeeId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Historial completo de accesos"
      description={employeeName}
      size="lg"
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
    >
      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
      ) : error ? (
        <ErrorState message={error} />
      ) : !records || records.length === 0 ? (
        <EmptyState title="Sin movimientos" description="No se registran accesos para este empleado." icon="history" />
      ) : (
        <ul className="max-h-[50vh] divide-y divide-outline-variant overflow-auto">
          {records.map((h) => (
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
    </Modal>
  );
}
