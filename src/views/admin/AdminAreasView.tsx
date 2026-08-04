import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { isApiError } from "@/lib/api";
import { useAreas } from "@/hooks/useGestor";
import type { ProductionArea } from "@/types";

export function AdminAreasView() {
  const areas = useAreas();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; area?: ProductionArea } | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setName("");
    setDescription("");
    setModal({ mode: "create" });
  };

  const openEdit = (area: ProductionArea) => {
    setName(area.name);
    setDescription(area.description ?? "");
    setModal({ mode: "edit", area });
  };

  const onSave = async () => {
    if (!modal) return;
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await areas.create(name.trim(), description.trim() || undefined);
        toast.success("Área creada");
      } else if (modal.area) {
        await areas.update(modal.area.id, name.trim(), description.trim() || undefined);
        toast.success("Área actualizada");
      }
      setModal(null);
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo guardar el área");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (area: ProductionArea) => {
    if (!window.confirm(`¿Eliminar el área "${area.name}"?`)) return;
    try {
      await areas.remove(area.id);
      toast.success("Área eliminada");
    } catch (err) {
      if (isApiError(err)) toast.error(err.message);
      else toast.error("No se pudo eliminar el área");
    }
  };

  const columns: Column<ProductionArea>[] = [
    { key: "name", header: "Nombre", render: (a) => <span className="text-body-md">{a.name}</span> },
    { key: "desc", header: "Descripción", render: (a) => a.description ?? "—" },
    { key: "actions", header: "", align: "right", render: (a) => (
      <div className="flex items-center justify-end gap-1">
        <Tooltip label="Editar área">
          <Button size="sm" variant="secondary" onClick={() => openEdit(a)} title="Editar">
            <Icon name="edit" size="sm" />
          </Button>
        </Tooltip>
        <Tooltip label="Eliminar área">
          <Button size="sm" variant="ghost" onClick={() => onDelete(a)} title="Eliminar">
            <Icon name="delete" size="sm" />
          </Button>
        </Tooltip>
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Áreas de Producción"
        subtitle="Administra las áreas restringidas del laboratorio"
        actions={
          <Button onClick={openCreate}>
            <Icon name="add" size="sm" /> Nueva Área
          </Button>
        }
      />

      {areas.loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : areas.error ? (
        <ErrorState message={areas.error.message} onRetry={areas.refresh} />
      ) : areas.data && areas.data.length > 0 ? (
        <DataTable columns={columns} data={areas.data} rowKey={(a) => a.id} />
      ) : (
        <EmptyState title="Sin áreas" description="Aún no se han registrado áreas." icon="domain_disabled" />
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Nueva área" : "Editar área"}
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
          <FormField id="areaName" label="Nombre" required>
            <input
              id="areaName"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </FormField>
          <FormField id="areaDesc" label="Descripción">
            <textarea
              id="areaDesc"
              className="input min-h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
