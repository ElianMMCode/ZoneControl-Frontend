import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, SelectField, Option } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserMutations } from "@/hooks/useUsers";
import { useResource } from "@/hooks/useResource";
import { isApiError } from "@/lib/api";
import { RolePill } from "@/components/common/RolePill";
import type { EmployeeSearchResponse, Page, UserStatus } from "@/types";

const schema = z.object({
  employeeCode: z.string().min(1, "Selecciona un empleado"),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateUserView() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const preselectedCode = params.get("employeeCode") ?? "";

  const { create, loading, error } = useUserMutations();
  const candidates = useResource<Page<EmployeeSearchResponse>>(
    "/api/admin/users/candidatos",
    { size: 100, page: 0 },
  );
  const [selected, setSelected] = useState<EmployeeSearchResponse | null>(null);
  const [success, setSuccess] = useState<{ id: string; setupUrl: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      employeeCode: preselectedCode,
      status: "ACTIVO" as UserStatus,
    },
  });

  useEffect(() => {
    if (!candidates.data || !preselectedCode) return;
    const match = candidates.data.content.find((e) => e.employeeCode === preselectedCode);
    if (match) {
      setValue("employeeCode", match.employeeCode, { shouldValidate: true });
      setSelected(match);
    }
  }, [candidates.data, preselectedCode, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const res = await create({
      employeeCode: values.employeeCode,
      status: values.status,
    });
    if (res) {
      toast.success("Usuario creado");
      setSuccess(res);
    } else {
      toast.error(error?.message ?? "No se pudo crear el usuario");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear nuevo usuario"
        subtitle="Vincula un empleado existente con una cuenta del sistema"
      />

      <section className="card max-w-2xl space-y-4">
        <h2 className="text-heading-md">Datos de acceso</h2>
        <Alert tone="info" title="Magic link">
          Al crear el usuario se generará un enlace de configuración que expira
          en 24 horas. El empleado deberá definir su contraseña al abrirlo.
        </Alert>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <FormField
            id="employeeCode"
            label="Empleado"
            error={errors.employeeCode?.message}
            required
          >
            {candidates.loading ? (
              <Skeleton className="h-10 w-full" />
            ) : candidates.data && candidates.data.content.length === 0 ? (
              <Alert tone="info" title="Sin candidatos disponibles">
                No hay empleados marcados con un rol de sistema pendientes de activación.
              </Alert>
            ) : (
              <Select
                id="employeeCode"
                aria-invalid={!!errors.employeeCode}
                {...register("employeeCode", {
                  onChange: (e) => {
                    const code = e.target.value;
                    const match = candidates.data?.content.find((emp) => emp.employeeCode === code);
                    setSelected(match ?? null);
                  },
                })}
              >
                <Option value="">Selecciona un empleado</Option>
                {candidates.data?.content.map((e) => (
                  <Option key={e.id} value={e.employeeCode}>
                    {e.employeeCode} — {e.firstName} {e.lastName} · {e.position}
                  </Option>
                ))}
              </Select>
            )}
          </FormField>

          {selected ? (
            <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-body-sm">
              <p>
                <span className="label-caps">Nombre</span> {selected.firstName}{" "}
                {selected.lastName}
              </p>
              <p>
                <span className="label-caps">Cargo</span> {selected.position}
              </p>
              <p>
                <span className="label-caps">Departamento</span>{" "}
                {selected.departmentName}
              </p>
              {selected.systemRole ? (
                <p className="mt-2 flex items-center gap-2">
                  <span className="label-caps">Rol del sistema</span>
                  <RolePill role={selected.systemRole} />
                </p>
              ) : (
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  El empleado no tiene un rol de sistema asignado (su cargo no lo define), por lo que no se puede crear el usuario.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="role" label="Rol del sistema">
              {selected?.systemRole ? (
                <div className="flex h-10 items-center rounded-md border border-outline-variant bg-surface-container/40 px-3">
                  <RolePill role={selected.systemRole} />
                </div>
              ) : (
                <input id="role" className="input" value="—" disabled />
              )}
              <p className="field-help">
                El rol se deriva del cargo del empleado (no se elige manualmente).
              </p>
            </FormField>
            <SelectField
              id="status"
              label="Estado inicial"
              error={errors.status?.message}
              required
            >
              <Select id="status" {...register("status")}>
                <Option value="ACTIVO">Activo</Option>
                <Option value="INACTIVO">Inactivo</Option>
              </Select>
            </SelectField>
          </div>

          {error && isApiError(error) ? (
            <Alert tone="error" title="No se pudo crear el usuario">
              {error.message}
            </Alert>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate("/admin/usuarios")}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {loading ? <Spinner /> : <Icon name="person_add" size="sm" />}{" "}
              Crear usuario
            </Button>
          </div>
        </form>
      </section>

      <Modal
        open={!!success}
        onClose={() => navigate("/admin/usuarios")}
        title="¡Usuario creado exitosamente!"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setSuccess(null);
              }}
            >
              Crear otro
            </Button>
            {success?.setupUrl ? (
              <Button variant="secondary" onClick={() => window.open(success.setupUrl, "_blank", "noopener")}>
                <Icon name="open_in_new" size="sm" /> Abrir configuración
              </Button>
            ) : null}
            <Button onClick={() => navigate("/admin/usuarios")}>
              Ir a Gestión de Usuarios
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary-container text-secondary">
            <Icon name="check_circle" size="lg" />
          </span>
          <p className="text-body-sm text-on-surface">
            Se ha generado un enlace de configuración que expirará en 24 horas.
            Como aún no hay envío de correo, usa el botón para abrir la
            configuración de contraseña en una nueva ventana.
          </p>
          <p className="font-mono text-body-sm text-on-surface-variant">
            ID: {success?.id}
          </p>
        </div>
      </Modal>
    </div>
  );
}
