import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, SelectField, Option } from "@/components/ui/Select";
import type { Role, UpdateUserRequest, UserResponse, UserStatus } from "@/types";

const schema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(35),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(35),
  email: z.string().email("Email inválido").max(100),
  role: z.enum(["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"]),
  status: z.enum(["ACTIVO", "INACTIVO"]),
});

type FormValues = z.infer<typeof schema>;

export function UserFormModal({
  open,
  user,
  onClose,
  onSubmit,
  loading,
}: {
  open: boolean;
  user: UserResponse | null;
  onClose: () => void;
  onSubmit: (values: UpdateUserRequest) => Promise<boolean>;
  loading?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { firstName: "", lastName: "", email: "", role: "GESTOR_PERSONAL" as Role, status: "ACTIVO" as UserStatus },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user, reset]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar usuario"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            onClick={handleSubmit(async (values) => {
              const ok = await onSubmit(values as UpdateUserRequest);
              if (ok) onClose();
            })}
            loading={loading}
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField id="firstName" label="Nombre" error={errors.firstName?.message} required>
            <input id="firstName" className="input" aria-invalid={!!errors.firstName} {...register("firstName")} />
          </FormField>
          <FormField id="lastName" label="Apellido" error={errors.lastName?.message} required>
            <input id="lastName" className="input" aria-invalid={!!errors.lastName} {...register("lastName")} />
          </FormField>
        </div>
        <FormField id="email" label="Email" error={errors.email?.message} required>
          <input id="email" type="email" className="input" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField id="role" label="Rol" error={errors.role?.message} required>
            <Select id="role" {...register("role")}>
              <Option value="ADMIN">Admin</Option>
              <Option value="GESTOR_PERSONAL">Gestor Personal</Option>
              <Option value="SUPERVISOR_AUDITOR">Supervisor Auditor</Option>
            </Select>
          </SelectField>
          <SelectField id="status" label="Estado" error={errors.status?.message} required>
            <Select id="status" {...register("status")}>
              <Option value="ACTIVO">Activo</Option>
              <Option value="INACTIVO">Inactivo</Option>
            </Select>
          </SelectField>
        </div>
      </form>
    </Modal>
  );
}
