import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusPill } from "@/components/common/StatusPill";
import { StatCard } from "@/components/common/StatCard";
import { useResource } from "@/hooks/useResource";
import { isApiError } from "@/lib/api";
import { useAreas, usePermissionMutations } from "@/hooks/useGestor";
import { PermissionFormModal, type PermissionFormValues } from "@/components/domain/PermissionFormModal";
import type { Page, PermissionResponse, PermissionStatus } from "@/types";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatTime(value: string) {
  return value.slice(0, 5);
}

export function PermissionsView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PermissionStatus | "">("");
  const [page, setPage] = useState(0);
  const [suspendTarget, setSuspendTarget] = useState<PermissionResponse | null>(null);
  const [reactivationDate, setReactivationDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingPermission, setEditingPermission] = useState<PermissionResponse | null>(null);
  const [revoking, setRevoking] = useState<PermissionResponse | null>(null);
  const [removing, setRemoving] = useState(false);

  const data = useResource<Page<PermissionResponse>>("/api/permisos", {
    search: search || undefined,
    status: status || undefined,
    page,
    size: 10,
  }, [search, status, page]);

  const activeCount = useResource<Page<PermissionResponse>>("/api/permisos", {
    status: "ACTIVO",
    page: 0,
    size: 1,
  }, []);
  const suspendedCount = useResource<Page<PermissionResponse>>("/api/permisos", {
    status: "SUSPENDIDO",
    page: 0,
    size: 1,
  }, []);

  const areas = useAreas();

  const { suspend, reactivate, revoke, create, update } = usePermissionMutations();

  const onReactivate = async (id: string) => {
    try {
      await reactivate(id);
      data.refresh();
      toast.success("Permiso reactivado");
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo reactivar");
    }
  };

  const onRevoke = async (permission: PermissionResponse) => {
    setRemoving(true);
    try {
      await revoke(permission.id);
      data.refresh();
      toast.success("Permiso revocado");
      setRevoking(null);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo revocar");
    } finally {
      setRemoving(false);
    }
  };

  const onSuspend = async () => {
    if (!suspendTarget || !reactivationDate) {
      toast.error("Selecciona la fecha de reactivación");
      return;
    }
    try {
      await suspend(suspendTarget.id, reactivationDate);
      toast.success("Permiso suspendido");
      setSuspendTarget(null);
      setReactivationDate("");
      data.refresh();
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo suspender");
    }
  };

  const onCreate = async (values: PermissionFormValues) => {
    try {
      await create({
        employeeCode: values.employeeCode,
        productionAreaName: values.productionAreaName,
        startDate: values.startDate,
        expirationDate: values.expirationDate,
        startTime: values.startTime,
        endTime: values.endTime,
        schedules: values.schedules,
      });
      toast.success("Permiso otorgado");
      data.refresh();
      return true;
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo otorgar el permiso");
      return false;
    }
  };

  const onEdit = async (values: PermissionFormValues) => {
    if (!editingPermission) return false;
    try {
      await update(editingPermission.id, {
        startDate: values.startDate,
        expirationDate: values.expirationDate,
        startTime: values.startTime,
        endTime: values.endTime,
        schedules: values.schedules,
      });
      toast.success("Permiso actualizado");
      data.refresh();
      return true;
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo actualizar el permiso");
      return false;
    }
  };

  const columns: Column<PermissionResponse>[] = useMemo(
    () => [
      { key: "emp", header: "Empleado", render: (p) => (
        <div>
          <p className="text-body-md">{p.employeeName}</p>
          <p className="font-mono text-body-sm text-on-surface-variant">{p.employeeCode}</p>
        </div>
      ) },
      { key: "area", header: "Área", render: (p) => p.areaName },
      { key: "schedule", header: "Horario", render: (p) => (
        <span className="font-mono text-body-sm">{formatTime(p.startTime)} – {formatTime(p.endTime)}</span>
      ) },
      { key: "vig", header: "Vigencia", render: (p) => (
        <span className="text-body-sm">{formatDate(p.startDate)} → {formatDate(p.expirationDate)}</span>
      ) },
      { key: "status", header: "Estado", render: (p) => <StatusPill status={p.status} /> },
      { key: "actions", header: "", align: "right", render: (p) => (
        <div className="flex items-center justify-end gap-1">
          {p.status === "SUSPENDIDO" && (
            <Button size="sm" variant="secondary" onClick={() => onReactivate(p.id)} title="Reactivar">
              <Icon name="lock_open" size="sm" />
            </Button>
          )}
          {p.status === "ACTIVO" && (
            <Button size="sm" variant="secondary" onClick={() => setEditingPermission(p)} title="Editar">
              <Icon name="edit" size="sm" />
            </Button>
          )}
          {p.status === "ACTIVO" && (
            <Button size="sm" variant="secondary" onClick={() => {
              setSuspendTarget(p);
              setReactivationDate("");
            }} title="Suspender">
              <Icon name="block" size="sm" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => setRevoking(p)} title="Revocar">
            <Icon name="delete" size="sm" />
          </Button>
        </div>
      ) },
    ],
    [data, reactivationDate, suspendTarget],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Permisos"
        subtitle="Permisos de acceso por empleado y área"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Icon name="add" size="sm" /> Otorgar permiso
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon="vpn_key"
          label="Permisos activos"
          value={activeCount.data?.totalElements ?? 0}
          tone="secondary"
        />
        <StatCard
          icon="pause_circle"
          label="Permisos suspendidos"
          value={suspendedCount.data?.totalElements ?? 0}
          tone="error"
        />
        <StatCard
          icon="domain"
          label="Áreas disponibles"
          value={areas.data?.length ?? 0}
          tone="primary"
        />
      </div>

      <section className="card space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FormField id="search" label="Buscar">
            <input
              id="search"
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Código, nombre o área"
            />
          </FormField>
          <FormField id="status" label="Estado">
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as PermissionStatus | "")}>
              <Option value="">Todos</Option>
              <Option value="ACTIVO">Activo</Option>
              <Option value="SUSPENDIDO">Suspendido</Option>
            </Select>
          </FormField>
          <div className="flex items-end justify-end">
            <Button onClick={() => { setPage(0); data.refresh(); }}>
              <Icon name="search" size="sm" /> Buscar
            </Button>
          </div>
        </div>
      </section>

      {data.loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : data.error ? (
        <ErrorState message={data.error.message} onRetry={data.refresh} />
      ) : data.data && data.data.content.length > 0 ? (
        <DataTable columns={columns} data={data.data.content} rowKey={(p) => p.id} />
      ) : (
        <EmptyState title="Sin permisos" description="No hay permisos que coincidan con los filtros." icon="vpn_key_off" />
      )}

      {data.data && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-body-sm text-on-surface-variant">
          <span>Mostrando {data.data.content.length} de {data.data.totalElements}</span>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron_left" size="sm" /> Anterior
            </Button>
            <span className="px-2">Página {page + 1} de {data.data.totalPages || 1}</span>
            <Button variant="secondary" size="sm" disabled={page + 1 >= data.data.totalPages} onClick={() => setPage((p) => p + 1)}>
              Siguiente <Icon name="chevron_right" size="sm" />
            </Button>
          </div>
        </div>
      )}

      <p className="text-body-sm text-on-surface-variant">
        ¿Necesitas asignar un permiso nuevo? Ve a <Link to="/personal" className="text-primary underline">Gestión de Personal</Link> y selecciona un empleado.
      </p>

      <Modal
        open={suspendTarget !== null}
        onClose={() => setSuspendTarget(null)}
        title="Suspender permiso"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSuspendTarget(null)}>Cancelar</Button>
            <Button onClick={onSuspend}><Icon name="block" size="sm" /> Suspender</Button>
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

      <PermissionFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSubmit={onCreate}
        showEmployeeSelector
        areas={areas.data ?? []}
        areasLoading={areas.loading}
      />

      <PermissionFormModal
        open={!!editingPermission}
        onClose={() => setEditingPermission(null)}
        onSubmit={onEdit}
        initial={editingPermission}
        areas={areas.data ?? []}
        areasLoading={areas.loading}
      />

      <ConfirmDialog
        open={!!revoking}
        title="Revocar permiso"
        message={
          revoking
            ? `¿Seguro que deseas revocar definitivamente el permiso de ${revoking.employeeName} para ${revoking.areaName}?`
            : ""
        }
        confirmLabel="Revocar"
        tone="danger"
        loading={removing}
        onCancel={() => setRevoking(null)}
        onConfirm={() => revoking && onRevoke(revoking)}
      />
    </div>
  );
}
