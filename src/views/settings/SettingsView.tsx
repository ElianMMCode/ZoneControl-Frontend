import { useEffect, useState } from "react";
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
import type { ChangePasswordRequest, UpdateProfileRequest, UpdateProfileResponse } from "@/types";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,60}$/;

const passwordSchema = z
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

const profileSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(35),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(35),
  email: z.string().email("Email inválido").max(100),
});

type PasswordValues = z.infer<typeof passwordSchema>;
type ProfileValues = z.infer<typeof profileSchema>;

const roleLabel: Record<string, string> = {
  ADMIN: "Administrador",
  GESTOR_PERSONAL: "Gestor de Personal",
  SUPERVISOR_AUDITOR: "Supervisor / Auditor",
};

function splitName(nombre?: string): { firstName: string; lastName: string } {
  if (!nombre) return { firstName: "", lastName: "" };
  const parts = nombre.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function SettingsView() {
  const { user, role, updateUsuario } = useAuth();
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordForm = useForm<PasswordValues>({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const profileForm = useForm<ProfileValues>({
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      const { firstName, lastName } = splitName(user.nombre);
      profileForm.reset({ firstName, lastName, email: user.email });
    }
  }, [user, profileForm]);

  const onPasswordSubmit = passwordForm.handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const body: ChangePasswordRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      const res = await apiFetch<{ message: string }>("/api/auth/change-password", { method: "POST", body });
      toast.success("Contraseña actualizada", { description: res.message });
      passwordForm.reset();
    } catch (e) {
      if (isApiError(e)) setErrorMsg(e.message);
      else setErrorMsg("No se pudo cambiar la contraseña. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  });

  const onProfileSubmit = profileForm.handleSubmit(async (values) => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const body: UpdateProfileRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      };
      const res = await apiFetch<UpdateProfileResponse>("/api/auth/profile", { method: "PUT", body });
      updateUsuario(`${res.firstName} ${res.lastName}`, res.email);
      toast.success("Perfil actualizado");
    } catch (e) {
      if (isApiError(e)) setProfileError(e.message);
      else setProfileError("No se pudo actualizar el perfil. Inténtalo de nuevo.");
    } finally {
      setSavingProfile(false);
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Ajustes y Perfil" subtitle="Administra tu cuenta y tu contraseña" />

      <section className="card space-y-4">
        <header className="card-header">
          <h2 className="text-heading-md">Perfil</h2>
          <span className="label-caps">
            <RolePill role={role ?? "GESTOR_PERSONAL"} /> {role ? roleLabel[role] : ""}
          </span>
        </header>

        {profileError ? (
          <Alert tone="error" title="No se pudo actualizar el perfil" className="mb-2">
            {profileError}
          </Alert>
        ) : null}

        <form className="max-w-md space-y-4" onSubmit={onProfileSubmit} noValidate>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="firstName" label="Nombre" error={profileForm.formState.errors.firstName?.message} required>
              <input id="firstName" className="input" aria-invalid={!!profileForm.formState.errors.firstName} {...profileForm.register("firstName")} />
            </FormField>
            <FormField id="lastName" label="Apellido" error={profileForm.formState.errors.lastName?.message} required>
              <input id="lastName" className="input" aria-invalid={!!profileForm.formState.errors.lastName} {...profileForm.register("lastName")} />
            </FormField>
          </div>
          <FormField id="profileEmail" label="Correo electrónico" error={profileForm.formState.errors.email?.message} required>
            <input id="profileEmail" type="email" className="input" aria-invalid={!!profileForm.formState.errors.email} {...profileForm.register("email")} />
          </FormField>
          <div className="flex justify-end">
            <Button type="submit" loading={savingProfile}>
              {savingProfile ? <Spinner /> : <Icon name="save" size="sm" />} Guardar perfil
            </Button>
          </div>
        </form>
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

        <form className="max-w-md space-y-4" onSubmit={onPasswordSubmit} noValidate>
          <FormField id="currentPassword" label="Contraseña actual" error={passwordForm.formState.errors.currentPassword?.message} required>
            <PasswordField id="currentPassword" autoComplete="current-password" aria-invalid={!!passwordForm.formState.errors.currentPassword} {...passwordForm.register("currentPassword")} />
          </FormField>
          <FormField id="newPassword" label="Nueva contraseña" error={passwordForm.formState.errors.newPassword?.message} required>
            <PasswordField id="newPassword" autoComplete="new-password" aria-invalid={!!passwordForm.formState.errors.newPassword} {...passwordForm.register("newPassword")} />
          </FormField>
          <FormField id="confirmPassword" label="Confirmar nueva contraseña" error={passwordForm.formState.errors.confirmPassword?.message} required>
            <PasswordField id="confirmPassword" autoComplete="new-password" aria-invalid={!!passwordForm.formState.errors.confirmPassword} {...passwordForm.register("confirmPassword")} />
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
