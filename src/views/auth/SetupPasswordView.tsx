import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/Input";
import { Button, Spinner } from "@/components/ui/Button";
import { PasswordField } from "@/components/common/PasswordField";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import { apiFetch, isApiError } from "@/lib/api";
import type { SetupPasswordRequest, SetupTokenValidationResponse } from "@/types";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,60}$/;

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(60, "Máximo 60 caracteres")
      .regex(passwordRegex, "Debe incluir mayúscula, minúscula, número y un carácter especial (@$!%*?&)"),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { message: "Las contraseñas no coinciden", path: ["confirmPassword"] });

type FormValues = z.infer<typeof schema>;

export function SetupPasswordView() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();

  const [validating, setValidating] = useState(true);
  const [info, setInfo] = useState<SetupTokenValidationResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { newPassword: "", confirmPassword: "" } });

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setLoadError("Falta el token de configuración. Usa el enlace enviado a tu correo.");
      return;
    }
    apiFetch<SetupTokenValidationResponse>("/api/setup-password", { query: { token } })
      .then((res) => setInfo(res))
      .catch((e) => {
        if (isApiError(e)) setLoadError(e.message);
        else setLoadError("No se pudo validar el enlace.");
      })
      .finally(() => setValidating(false));
  }, [token]);

  const onSubmit = handleSubmit(async (values) => {
    if (!token) return;
    setSubmitting(true);
    try {
      const body: SetupPasswordRequest = { token, newPassword: values.newPassword };
      await apiFetch<{ message: string }>("/api/setup-password", { method: "POST", body });
      setDone(true);
      toast.success("Contraseña configurada");
      setTimeout(() => navigate("/login", { replace: true }), 1500);
    } catch (e) {
      if (isApiError(e)) setLoadError(e.message);
    } finally {
      setSubmitting(false);
    }
  });

  if (validating) {
    return (
      <section className="w-full max-w-md">
        <div className="card flex items-center justify-center py-12"><Spinner className="h-6 w-6 text-primary" /></div>
      </section>
    );
  }

  if (loadError && !info) {
    return (
      <section className="w-full max-w-md">
        <div className="card space-y-3">
          <Alert tone="error" title="Enlace no válido">{loadError}</Alert>
          <Link to="/login" className="btn btn-md btn-primary w-full">Ir a iniciar sesión</Link>
        </div>
      </section>
    );
  }

  if (done) {
    return (
      <section className="w-full max-w-md">
        <div className="card space-y-3 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary-container text-secondary">
            <Icon name="check_circle" size="lg" />
          </span>
          <h1 className="text-heading-md">Contraseña configurada</h1>
          <p className="text-body-sm text-on-surface-variant">Ya puedes iniciar sesión.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md">
      <div className="card space-y-4">
        <header>
          <h1 className="text-heading-lg">Configura tu contraseña</h1>
          {info ? (
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Hola <strong>{info.fullName}</strong> · {info.email}
            </p>
          ) : null}
        </header>
        <Alert tone="info" title="Requisitos de seguridad">
          Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un dígito y un carácter especial (@$!%*?&).
        </Alert>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="newPassword" label="Nueva contraseña" error={errors.newPassword?.message} required>
            <PasswordField id="newPassword" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </FormField>
          <FormField id="confirmPassword" label="Confirmar contraseña" error={errors.confirmPassword?.message} required>
            <PasswordField id="confirmPassword" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          </FormField>
          <Button type="submit" size="lg" className="w-full" loading={submitting}>
            {submitting ? <Spinner /> : <Icon name="lock_reset" size="sm" />} Guardar contraseña
          </Button>
        </form>
      </div>
    </section>
  );
}
