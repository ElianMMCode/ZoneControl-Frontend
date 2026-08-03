import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useUserMutations } from "@/hooks/useUsers";
import { useResource } from "@/hooks/useResource";
import { isApiError } from "@/lib/api";
import type { EmployeeSearchResponse, Page, Role, UserStatus } from "@/types";

const schema = z.object({
  employeeCode: z.string().min(1, "Selecciona un empleado"),
  role: z.enum(["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"]),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormValues = z.infer<typeof schema>;

export function CreateUserView() {
  const navigate = useNavigate();
  const { create, loading, error } = useUserMutations();
  const employees = useResource<Page<EmployeeSearchResponse>>("/api/personal", { size: 100, page: 0 });

  const [selected, setSelected] = useState<EmployeeSearchResponse | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { employeeCode: "", role: "GESTOR_PERSONAL" as Role, status: "ACTIVO" as UserStatus } });

  const onSubmit = handleSubmit(async (values) => {
    const id = await create({ employeeCode: values.employeeCode, role: values.role, status: values.status });
    if (id) {
      toast.success("Usuario creado");
      setSuccess(id);
    } else {
      toast.error(error?.message ?? "No se pudo crear el usuario");
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Crear nuevo usuario" subtitle="Vincula un empleado existente con una cuenta del sistema" />

      <section className="card max-w-2xl space-y-4">
        <h2 className="text-heading-md">Datos de acceso</h2>
        <Alert tone="info" title="Magic link">
          Al crear el usuario se generará un enlace de configuración que expira en 24 horas. El empleado deberá definir su contraseña al abrirlo.
        </Alert>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="employeeCode" label="Empleado" error={errors.employeeCode?.message} required>
            <Select
              id="employeeCode"
              aria-invalid={!!errors.employeeCode}
              {...register("employeeCode", {
                onChange: (e) => {
                  const code = e.target.value;
                  setSelected(employees.data?.content.find((emp) => emp.employeeCode === code) ?? null);
                },
              })}
            >
              <Option value="">Selecciona un empleado</Option>
              {employees.data?.content.map((e) => (
                <Option key={e.id} value={e.employeeCode}>
                  {e.employeeCode} — {e.firstName} {e.lastName} · {e.position}
                </Option>
              ))}
            </Select>
          </FormField>

          {selected ? (
            <div className="rounded-md border border-outline-variant bg-surface-container-low p-3 text-body-sm">
              <p><span className="label-caps">Nombre</span> {selected.firstName} {selected.lastName}</p>
              <p><span className="label-caps">Cargo</span> {selected.position}</p>
              <p><span className="label-caps">Departamento</span> {selected.departmentName}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField id="role" label="Rol" error={errors.role?.message} required>
              <Select id="role" {...register("role")}>
                <Option value="ADMIN">Admin</Option>
                <Option value="GESTOR_PERSONAL">Gestor Personal</Option>
                <Option value="SUPERVISOR_AUDITOR">Supervisor Auditor</Option>
              </Select>
            </SelectField>
            <SelectField id="status" label="Estado inicial" error={errors.status?.message} required>
              <Select id="status" {...register("status")}>
                <Option value="ACTIVO">Activo</Option>
                <Option value="INACTIVO">Inactivo</Option>
              </Select>
            </SelectField>
          </div>

          {error && isApiError(error) ? <Alert tone="error" title="No se pudo crear el usuario">{error.message}</Alert> : null}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate("/admin/usuarios")}>Cancelar</Button>
            <Button type="submit" loading={loading}>
              {loading ? <Spinner /> : <Icon name="person_add" size="sm" />} Crear usuario
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
            <Button variant="secondary" onClick={() => { setSuccess(null); }}>Crear otro</Button>
            <Button onClick={() => navigate("/admin/usuarios")}>Ir a Gestión de Usuarios</Button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary-container text-secondary">
            <Icon name="check_circle" size="lg" />
          </span>
          <p className="text-body-sm text-on-surface">
            Se ha generado un enlace de configuración que expirará en 24 horas. El empleado deberá abrir el enlace desde su correo para definir su contraseña.
          </p>
          <p className="font-mono text-body-sm text-on-surface-variant">ID: {success}</p>
        </div>
      </Modal>
    </div>
  );
}
