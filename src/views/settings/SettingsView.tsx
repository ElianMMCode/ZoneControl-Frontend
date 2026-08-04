import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { RolePill } from "@/components/common/RolePill";
import { Alert } from "@/components/ui/Alert";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { PasswordField } from "@/components/common/PasswordField";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, isApiError } from "@/lib/api";
import type { ChangePasswordRequest } from "@/types";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,60}$/;

const schema = z
  .object({
    currentPassword: z.string().min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(60, "Máximo 60 caracteres")
      .regex(passwordRegex, "Debe incluir mayúscula, minúscula, número y un carácter especial (@$!%*?&)"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR_PERSONAL: "Gestor de Personal",
  SUPERVISOR_AUDITOR: "Supervisor / Auditor",
};

export function SettingsView() {
  const { user, role } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const body: ChangePasswordRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      const res = await apiFetch<{ message: string }>("/api/auth/change-password", { method: "POST", body });
      toast.success("Contraseña actualizada", { description: res.message });
      reset();
    } catch (e) {
      if (isApiError(e)) setErrorMsg(e.message);
      else setErrorMsg("No se pudo cambiar la contraseña. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes y Perfil" subtitle="Administra tu cuenta y tu contraseña" />

      <section className="card space-y-4">
        <h2 className="text-heading-md">Perfil</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="label-caps">Nombre completo</dt>
            <dd className="text-body-md text-on-surface">{user?.nombre ?? "—"}</dd>
          </div>
          <div>
            <dt className="label-caps">Correo electrónico</dt>
            <dd className="text-body-md text-on-surface">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="label-caps">Rol asignado</dt>
            <dd className="mt-1">
              <div className="flex items-center gap-2">
                <RolePill role={role ?? "GESTOR_PERSONAL"} />
                <span className="text-body-sm text-on-surface-variant">{role ? roleLabel[role] : ""}</span>
              </div>
            </dd>
          </div>
        </dl>
      </section>

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Seguridad de la cuenta</h2>
          <span className="label-caps">Cambiar contraseña</span>
        </header>

        <Alert tone="info" title="Requisitos de seguridad">
          Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un dígito y un carácter especial (@$!%*?&).
        </Alert>

        {errorMsg ? (
          <Alert tone="error" title="No se pudo cambiar la contraseña" className="mb-4">
            {errorMsg}
          </Alert>
        ) : null}

        <form className="max-w-md space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="currentPassword" label="Contraseña actual" error={errors.currentPassword?.message} required>
            <PasswordField id="currentPassword" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
          </FormField>
          <FormField id="newPassword" label="Nueva contraseña" error={errors.newPassword?.message} required>
            <PasswordField id="newPassword" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </FormField>
          <FormField id="confirmPassword" label="Confirmar nueva contraseña" error={errors.confirmPassword?.message} required>
            <PasswordField id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={submitting}>
              {submitting ? <Spinner /> : <Icon name="save" size="sm" />} Cambiar contraseña
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
