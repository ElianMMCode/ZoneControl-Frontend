import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { StatCard } from "@/components/common/StatCard";
import { QuickActions } from "@/components/common/QuickActions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useResource } from "@/hooks/useResource";
import { employeeListQuery } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useGestor";
import type { DocumentType, EmployeeSearchResponse, EmployeeStatus, Page } from "@/types";

export function EmployeeListView() {
  const navigate = useNavigate();
  const departments = useDepartments();
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [page, setPage] = useState(0);

  const data = useResource<Page<EmployeeSearchResponse>>(
    "/api/personal",
    employeeListQuery({
      documentType: documentType || undefined,
      documentNumber: documentNumber || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      departmentName: departmentName || undefined,
      status: status || undefined,
      page,
      size: 10,
    }),
    [documentType, documentNumber, firstName, lastName, departmentName, status, page],
  );

  // KPIs derivados de la respuesta actual (de la página actual).
  const counts = data.data?.content.reduce(
    (acc, e) => {
      acc.total++;
      if (e.status === "ACTIVO") acc.activos++;
      else if (e.status === "INACTIVO") acc.inactivos++;
      else if (e.status === "SUSPENDIDO") acc.suspendidos++;
      return acc;
    },
    { total: 0, activos: 0, inactivos: 0, suspendidos: 0 },
  ) ?? { total: 0, activos: 0, inactivos: 0, suspendidos: 0 };

  const columns: Column<EmployeeSearchResponse>[] = [
    { key: "code", header: "Código", render: (e) => <code className="font-mono text-body-sm">{e.employeeCode}</code> },
    { key: "doc", header: "Documento", render: (e) => `${e.documentType} ${e.documentNumber}` },
    { key: "name", header: "Nombre", render: (e) => `${e.firstName} ${e.lastName}` },
    { key: "position", header: "Cargo", render: (e) => e.position },
    { key: "dept", header: "Departamento", render: (e) => e.departmentName },
    { key: "status", header: "Estado", render: (e) => <StatusPill status={e.status} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (e) => (
        <Link
          to={`/personal/${e.id}`}
          aria-label="Ver detalle"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container"
        >
          <Icon name="chevron_right" size="sm" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Personal"
        subtitle="Directorio de empleados del laboratorio"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/personal/carga-masiva")}>
              <Icon name="upload_file" size="sm" /> Carga masiva
            </Button>
            <Button onClick={() => navigate("/personal/nuevo")}>
              <Icon name="person_add" size="sm" /> Registrar
            </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon="group"
          label="Empleados (página)"
          value={counts.total}
          tone="primary"
        />
        <StatCard
          icon="verified"
          label="Activos"
          value={counts.activos}
          tone="secondary"
          progress={{
            percent: counts.total ? (counts.activos / counts.total) * 100 : 0,
            tone: "secondary",
          }}
        />
        <StatCard
          icon="block"
          label="Suspendidos / Inactivos"
          value={counts.suspendidos + counts.inactivos}
          tone="error"
          progress={{
            percent: counts.total ? ((counts.suspendidos + counts.inactivos) / counts.total) * 100 : 0,
            tone: "error",
          }}
        />
      </section>

      <QuickActions
        actions={[
          { label: "Registrar personal", icon: "person_add", to: "/personal/nuevo" },
          { label: "Carga masiva", icon: "upload_file", to: "/personal/carga-masiva" },
          { label: "Gestión de permisos", icon: "vpn_key", to: "/permisos" },
        ]}
      />

      <section className="card space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FormField id="docType" label="Tipo documento">
            <Select id="docType" value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType | "")}>
              <Option value="">Todos</Option>
              <Option value="CC">CC</Option>
              <Option value="CE">CE</Option>
              <Option value="TI">TI</Option>
              <Option value="PA">PA</Option>
              <Option value="RC">RC</Option>
            </Select>
          </FormField>
          <FormField id="docNum" label="Nº documento">
            <input id="docNum" className="input" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
          </FormField>
          <FormField id="status" label="Estado">
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus | "")}>
              <Option value="">Todos</Option>
              <Option value="ACTIVO">Activo</Option>
              <Option value="INACTIVO">Inactivo</Option>
              <Option value="SUSPENDIDO">Suspendido</Option>
            </Select>
          </FormField>
          <FormField id="firstName" label="Nombres">
            <input id="firstName" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </FormField>
          <FormField id="lastName" label="Apellidos">
            <input id="lastName" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </FormField>
          <FormField id="dept" label="Departamento">
            <Select id="dept" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} disabled={departments.loading}>
              <Option value="">Todos</Option>
              {departments.data?.map((d) => (
                <Option key={d} value={d}>{d}</Option>
              ))}
            </Select>
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setPage(0)}>
            <Icon name="search" size="sm" /> Buscar
          </Button>
        </div>
      </section>

      {data.loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
      ) : data.error ? (
        <ErrorState message={data.error.message} onRetry={data.refresh} />
      ) : data.data && data.data.content.length > 0 ? (
        <DataTable columns={columns} data={data.data.content} rowKey={(e) => e.id} />
      ) : (
        <EmptyState title="Sin resultados" description="No hay empleados que coincidan con los filtros." icon="person_off" />
      )}

      {data.data ? (
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
      ) : null}
    </div>
  );
}
