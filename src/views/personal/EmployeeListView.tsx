import { useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusPill } from "@/components/common/StatusPill";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useResource } from "@/hooks/useResource";
import { employeeListQuery } from "@/hooks/useEmployees";
import { isApiError } from "@/lib/api";
import type { DocumentType, EmployeeSearchResponse, EmployeeStatus, Page } from "@/types";

export function EmployeeListView() {
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [status, setStatus] = useState<EmployeeStatus | "">("");
  const [page, setPage] = useState(0);

  const applied = {
    documentType: documentType || undefined,
    documentNumber: documentNumber || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    departmentName: departmentName || undefined,
    status: status || undefined,
    page,
    size: 10,
  };

  const data = useResource<Page<EmployeeSearchResponse>>("/api/personal", employeeListQuery(applied), [
    documentType, documentNumber, firstName, lastName, departmentName, status, page,
  ]);

  const columns: Column<EmployeeSearchResponse>[] = [
    { key: "code", header: "Código", render: (e) => <code className="font-mono text-body-sm">{e.employeeCode}</code> },
    { key: "doc", header: "Documento", render: (e) => `${e.documentType} ${e.documentNumber}` },
    { key: "name", header: "Nombre", render: (e) => `${e.firstName} ${e.lastName}` },
    { key: "position", header: "Cargo", render: (e) => e.position },
    { key: "dept", header: "Departamento", render: (e) => e.departmentName },
    { key: "status", header: "Estado", render: (e) => <StatusPill status={e.status} /> },
    { key: "actions", header: "", align: "right", render: () => (
      <Button variant="ghost" size="sm" aria-label="Ver detalle"><Icon name="chevron_right" size="sm" /></Button>
    ) },
  ];

  const onSearch = () => setPage(0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Personal"
        subtitle="Directorio de empleados del laboratorio"
        actions={<Button variant="secondary"><Icon name="upload_file" size="sm" /> Carga masiva</Button>}
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
            <input id="dept" className="input" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Control de Calidad" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSearch}><Icon name="search" size="sm" /> Buscar</Button>
        </div>
      </section>

      {data.error && isApiError(data.error) && data.error.status === 400 ? (
        <EmptyState
          title="Selecciona al menos un filtro"
          description="La búsqueda de personal requiere al menos un criterio para evitar listar todo el directorio."
          icon="filter_alt"
        />
      ) : data.loading ? (
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
