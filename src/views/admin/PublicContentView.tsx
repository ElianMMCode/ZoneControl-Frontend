import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { DataTable, type Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { InstitutionalForm } from "@/components/admin/content/InstitutionalForm";
import { ContactForm } from "@/components/admin/content/ContactForm";
import { OfficeFormModal } from "@/components/admin/content/OfficeFormModal";
import { ProductFormModal } from "@/components/admin/content/ProductFormModal";
import { BrochureManager } from "@/components/admin/content/BrochureManager";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { usePublicData } from "@/hooks/usePublicData";
import { useContentMutations } from "@/hooks/useContentMutations";
import { toast } from "sonner";
import type {
  CatalogResponse,
  OfficeRequest,
  OfficeResponse,
  ProductRequest,
} from "@/types";

type TabId = "institucional" | "contacto" | "sedes" | "catalogo" | "folleto";

const TABS: TabItem[] = [
  { id: "institucional", label: "Institucional" },
  { id: "contacto", label: "Contacto" },
  { id: "sedes", label: "Sedes" },
  { id: "catalogo", label: "Catálogo" },
  { id: "folleto", label: "Folleto" },
];

export function PublicContentView() {
  const [active, setActive] = useState<TabId>("institucional");
  const publicData = usePublicData();
  const refreshAll = () => publicData.refresh();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contenido Público"
        subtitle="Gestiona la información que ven los visitantes del sitio"
        actions={
          <Button variant="ghost" onClick={refreshAll}>
            <Icon name="refresh" size="sm" /> Actualizar
          </Button>
        }
      />

      <Tabs
        items={TABS}
        value={active}
        onChange={(v) => setActive(v as TabId)}
      />

      {publicData.error && active !== "folleto" ? (
        <ErrorState
          message={publicData.error}
          onRetry={refreshAll}
        />
      ) : null}

      {active === "institucional" ? (
        <section className="card">
          <InstitutionalForm
            initial={publicData.institutional?.info}
            onSaved={refreshAll}
          />
        </section>
      ) : null}

      {active === "contacto" ? (
        <section className="card">
          <ContactForm
            initial={publicData.contact?.contact}
            onSaved={refreshAll}
          />
        </section>
      ) : null}

      {active === "sedes" ? (
        <OfficesPanel
          offices={publicData.sedes}
          loading={publicData.loading}
          error={publicData.error}
          onRefresh={refreshAll}
        />
      ) : null}

      {active === "catalogo" ? (
        <ProductsPanel
          products={publicData.catalogo}
          loading={publicData.loading}
          error={publicData.error}
          onRefresh={refreshAll}
        />
      ) : null}

      {active === "folleto" ? <BrochureManager /> : null}
    </div>
  );
}

function OfficesPanel({
  offices,
  loading,
  error,
  onRefresh,
}: {
  offices: OfficeResponse[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const mutations = useContentMutations();
  const [editing, setEditing] = useState<OfficeResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<OfficeResponse | null>(null);
  const [removingImage, setRemovingImage] = useState(false);

  const handleSubmit = async (values: OfficeRequest, imageFile: File | null) => {
    if (editing) {
      const res = await mutations.updateOffice(editing.id, values);
      if (res) {
        if (imageFile) {
          const img = await mutations.uploadOfficeImage(editing.id, imageFile);
          if (!img) {
            toast.error(mutations.error?.message ?? "No se pudo subir la imagen");
          }
        }
        toast.success("Sede actualizada");
        onRefresh();
      } else {
        toast.error(mutations.error?.message ?? "No se pudo actualizar la sede");
      }
      return !!res;
    }
    const res = await mutations.createOffice(values);
    if (res) {
      if (imageFile && res.id) {
        const img = await mutations.uploadOfficeImage(res.id, imageFile);
        if (!img) {
          toast.error(mutations.error?.message ?? "No se pudo subir la imagen");
        }
      }
      toast.success("Sede creada");
      onRefresh();
    } else {
      toast.error(mutations.error?.message ?? "No se pudo crear la sede");
    }
    return !!res;
  };

  const handleRemoveImage = async () => {
    if (!editing) return false;
    setRemovingImage(true);
    const res = await mutations.deleteOfficeImage(editing.id);
    setRemovingImage(false);
    if (res) onRefresh();
    else toast.error(mutations.error?.message ?? "No se pudo quitar la imagen");
    return !!res;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await mutations.deleteOffice(deleting.id);
    if (res) {
      toast.success("Sede eliminada");
      onRefresh();
      setDeleting(null);
    } else {
      toast.error(mutations.error?.message ?? "No se pudo eliminar la sede");
    }
  };

  const columns: Column<OfficeResponse>[] = [
    {
      key: "image",
      header: "",
      render: (o) => (
        <div className="h-10 w-10 overflow-hidden rounded-md bg-surface-container-highest ring-1 ring-outline-variant">
          {o.imageUrl ? (
            <img src={o.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-on-surface-variant">
              <Icon name="location_on" size="sm" />
            </div>
          )}
        </div>
      ),
    },
    { key: "name", header: "Nombre", render: (o) => o.name },
    { key: "address", header: "Dirección", render: (o) => o.address },
    { key: "hours", header: "Horario", render: (o) => o.openingHours || "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (o) => (
        <div className="flex justify-end gap-1">
          <Tooltip label="Editar sede">
            <Button variant="ghost" size="sm" onClick={() => setEditing(o)} aria-label={`Editar ${o.name}`}>
              <Icon name="edit" size="sm" />
            </Button>
          </Tooltip>
          <Tooltip label="Eliminar sede">
            <Button variant="ghost" size="sm" onClick={() => setDeleting(o)} aria-label={`Eliminar ${o.name}`}>
              <Icon name="delete" size="sm" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  return (
    <section className="card space-y-4">
      <header className="card-header">
        <h2 className="text-heading-md">Sedes</h2>
        <Button onClick={() => setCreating(true)}>
          <Icon name="add" size="sm" /> Nueva sede
        </Button>
      </header>
      {offices.length === 0 ? (
        <EmptyState
          title="Sin sedes"
          description="No hay sedes registradas. Crea la primera."
          icon="location_off"
        />
      ) : (
        <DataTable columns={columns} data={offices} rowKey={(o) => o.id} />
      )}
      <OfficeFormModal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={mutations.loading}
        errorMessage={mutations.error?.message}
        removingImage={removingImage}
        onRemoveImage={handleRemoveImage}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar sede"
        message={
          deleting
            ? `¿Seguro que deseas eliminar la sede "${deleting.name}"?`
            : ""
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={mutations.loading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}

function ProductsPanel({
  products,
  loading,
  error,
  onRefresh,
}: {
  products: CatalogResponse[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  const mutations = useContentMutations();
  const [editing, setEditing] = useState<CatalogResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<CatalogResponse | null>(null);
  const [removingImage, setRemovingImage] = useState(false);

  const handleSubmit = async (values: ProductRequest, imageFile: File | null) => {
    if (editing) {
      const res = await mutations.updateProduct(editing.id, values);
      if (res) {
        if (imageFile) {
          const img = await mutations.uploadProductImage(editing.id, imageFile);
          if (!img) {
            toast.error(mutations.error?.message ?? "No se pudo subir la imagen");
          }
        }
        toast.success("Producto actualizado");
        onRefresh();
      } else {
        toast.error(mutations.error?.message ?? "No se pudo actualizar el producto");
      }
      return !!res;
    }
    const res = await mutations.createProduct(values);
    if (res) {
      if (imageFile && res.id) {
        const img = await mutations.uploadProductImage(res.id, imageFile);
        if (!img) {
          toast.error(mutations.error?.message ?? "No se pudo subir la imagen");
        }
      }
      toast.success("Producto creado");
      onRefresh();
    } else {
      toast.error(mutations.error?.message ?? "No se pudo crear el producto");
    }
    return !!res;
  };

  const handleRemoveImage = async () => {
    if (!editing) return false;
    setRemovingImage(true);
    const res = await mutations.deleteProductImage(editing.id);
    setRemovingImage(false);
    if (res) onRefresh();
    else toast.error(mutations.error?.message ?? "No se pudo quitar la imagen");
    return !!res;
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await mutations.deleteProduct(deleting.id);
    if (res) {
      toast.success("Producto eliminado");
      onRefresh();
      setDeleting(null);
    } else {
      toast.error(mutations.error?.message ?? "No se pudo eliminar el producto");
    }
  };

  const columns: Column<CatalogResponse>[] = [
    {
      key: "image",
      header: "",
      render: (p) => (
        <div className="h-10 w-10 overflow-hidden rounded-md bg-surface-container-highest ring-1 ring-outline-variant">
          {p.imageUrl ? (
            <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center text-on-surface-variant">
              <Icon name="medication" size="sm" />
            </div>
          )}
        </div>
      ),
    },
    { key: "name", header: "Nombre", render: (p) => p.name },
    {
      key: "ingredient",
      header: "Principio activo",
      render: (p) => p.activeIngredient || "—",
    },
    { key: "presentation", header: "Presentación", render: (p) => p.presentation || "—" },
    {
      key: "area",
      header: "Área",
      render: (p) => p.productionArea || "—",
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Tooltip label="Editar producto">
            <Button variant="ghost" size="sm" onClick={() => setEditing(p)} aria-label={`Editar ${p.name}`}>
              <Icon name="edit" size="sm" />
            </Button>
          </Tooltip>
          <Tooltip label="Eliminar producto">
            <Button variant="ghost" size="sm" onClick={() => setDeleting(p)} aria-label={`Eliminar ${p.name}`}>
              <Icon name="delete" size="sm" />
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (error) {
    return <ErrorState message={error} onRetry={onRefresh} />;
  }

  return (
    <section className="card space-y-4">
      <header className="card-header">
        <h2 className="text-heading-md">Catálogo de productos</h2>
        <Button onClick={() => setCreating(true)}>
          <Icon name="add" size="sm" /> Nuevo producto
        </Button>
      </header>
      {products.length === 0 ? (
        <EmptyState
          title="Sin productos"
          description="No hay productos en el catálogo. Crea el primero."
          icon="inventory_2"
        />
      ) : (
        <DataTable columns={columns} data={products} rowKey={(p) => p.id} />
      )}
      <ProductFormModal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
        loading={mutations.loading}
        errorMessage={mutations.error?.message}
        removingImage={removingImage}
        onRemoveImage={handleRemoveImage}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar producto"
        message={
          deleting
            ? `¿Seguro que deseas eliminar el producto "${deleting.name}"?`
            : ""
        }
        confirmLabel="Eliminar"
        tone="danger"
        loading={mutations.loading}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
