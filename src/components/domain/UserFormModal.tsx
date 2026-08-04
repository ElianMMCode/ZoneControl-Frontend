import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { RolePill } from "@/components/common/RolePill";
import { StatusPill } from "@/components/common/StatusPill";
import type { UpdateUserRequest, UserResponse } from "@/types";

const schema = z.object({
  email: z.string().email("Email inválido").max(100),
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
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (user) {
      reset({ email: user.email });
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
        {user ? (
          <div className="grid grid-cols-2 gap-3 rounded-md border border-outline-variant bg-surface-container-low p-4 text-body-sm">
            <div>
              <span className="label-caps">Nombre completo</span>
              <p className="mt-1 text-on-surface">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <span className="label-caps">Código empleado</span>
              <p className="mt-1 font-mono text-on-surface">{user.employeeCode}</p>
            </div>
            <div>
              <span className="label-caps">Rol</span>
              <p className="mt-1"><RolePill role={user.role} /></p>
            </div>
            <div>
              <span className="label-caps">Estado</span>
              <p className="mt-1"><StatusPill status={user.status} /></p>
            </div>
          </div>
        ) : null}
        <p className="text-body-sm text-on-surface-variant">
          Nombre, apellido y cargo reflejan al empleado vinculado y se gestionan
          en Gestión de Personal. Aquí solo puedes cambiar el correo.
        </p>
        <FormField id="email" label="Email" error={errors.email?.message} required>
          <input id="email" type="email" className="input" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
      </form>
    </Modal>
  );
}
