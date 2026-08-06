import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RolePill } from "@/components/common/RolePill";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { isApiError } from "@/lib/api";
import { useCargos } from "@/hooks/useGestor";
import type { Position } from "@/types";

export function AdminCargosView() {
  const cargos = useCargos();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; cargo?: Position } | null>(null);
  const [name, setName] = useState("");
  const [systemRole, setSystemRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Position | null>(null);
  const [removing, setRemoving] = useState(false);

  const openCreate = () => {
    setName("");
    setSystemRole("");
    setModal({ mode: "create" });
  };

  const openEdit = (cargo: Position) => {
    setName(cargo.name);
    setSystemRole(cargo.systemRole ?? "");
    setModal({ mode: "edit", cargo });
  };

  const onSave = async () => {
    if (!modal) return;
    if (!name.trim()) {
      toast.error("El nombre del cargo es obligatorio");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await cargos.create(name.trim(), systemRole || null);
        toast.success("Cargo creado");
      } else if (modal.cargo) {
        await cargos.update(modal.cargo.id, name.trim(), systemRole || null);
        toast.success("Cargo actualizado");
      }
      setModal(null);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo guardar el cargo");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (cargo: Position) => {
    setRemoving(true);
    try {
      await cargos.remove(cargo.id);
      toast.success("Cargo eliminado");
      setDeleting(null);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo eliminar el cargo");
    } finally {
      setRemoving(false);
    }
  };

  const columns: Column<Position>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (c) => (
        <span className="flex items-center gap-2 text-body-md">
          <Icon name="badge" size="sm" className="text-on-surface-variant" />
          {c.name}
        </span>
      ),
    },
    {
      key: "role",
      header: "Rol de sistema",
      render: (c) =>
        c.systemRole ? (
          <RolePill role={c.systemRole} />
        ) : (
          <span className="text-body-sm text-on-surface-variant/60">Sin rol</span>
        ),
    },
    { key: "actions", header: "", align: "right", render: (c) => (
      <div className="flex items-center justify-end gap-1">
        <Tooltip label="Editar cargo">
          <Button size="sm" variant="secondary" onClick={() => openEdit(c)} title="Editar">
            <Icon name="edit" size="sm" />
          </Button>
        </Tooltip>
        <Tooltip label="Eliminar cargo">
          <Button size="sm" variant="ghost" onClick={() => setDeleting(c)} title="Eliminar">
            <Icon name="delete" size="sm" />
          </Button>
        </Tooltip>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cargos"
        subtitle="Catálogo de cargos de la compañía: el rol de usuario se deriva del cargo del empleado"
        actions={
          <Button onClick={openCreate}>
            <Icon name="add" size="sm" /> Nuevo Cargo
          </Button>
        }
      />

      {cargos.loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : cargos.error ? (
        <ErrorState message={cargos.error.message} onRetry={cargos.refresh} />
      ) : cargos.data && cargos.data.length > 0 ? (
        <section className="card space-y-4">
          <header className="card-header">
            <h2 className="text-heading-md">Cargos registrados</h2>
            <span className="label-caps">{cargos.data.length} CARGOS</span>
          </header>
          <DataTable columns={columns} data={cargos.data} rowKey={(c) => c.id} />
          <p className="text-body-sm text-on-surface-variant">
            Un cargo con rol de sistema convierte al empleado en candidato a usuario del sistema (HU-05).
          </p>
        </section>
      ) : (
        <EmptyState title="Sin cargos" description="Aún no se han registrado cargos." icon="badge" />
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Nuevo cargo" : "Editar cargo"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
            <Button onClick={onSave} disabled={saving}>
              <Icon name="save" size="sm" /> {saving ? "Guardando…" : "Guardar"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <FormField id="cargoName" label="Nombre" required help="Máximo 40 caracteres. El nombre debe ser único.">
            <input
              id="cargoName"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </FormField>
          <FormField id="cargoRole" label="Rol de sistema" help="Opcional. Si se define, el empleado con este cargo es candidato a usuario del sistema.">
            <Select id="cargoRole" value={systemRole} onChange={(e) => setSystemRole(e.target.value)}>
              <Option value="">Sin rol</Option>
              <Option value="ADMIN">Administrador</Option>
              <Option value="GESTOR_PERSONAL">Gestor de Personal</Option>
              <Option value="SUPERVISOR_AUDITOR">Supervisor / Auditor</Option>
            </Select>
          </FormField>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Eliminar cargo"
        message={deleting ? `¿Seguro que deseas eliminar el cargo "${deleting.name}"?` : ""}
        confirmLabel="Eliminar"
        tone="danger"
        loading={removing}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && onDelete(deleting)}
      />
    </div>
  );
}
