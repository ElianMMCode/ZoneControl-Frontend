import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/Input";
import { Button, Spinner } from "@/components/ui/Button";
import { PasswordField } from "@/components/common/PasswordField";
import { Alert } from "@/components/ui/Alert";
import { apiFetch, isApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Icon } from "@/components/ui/Icon";
import type { LoginResponse, Role } from "@/types";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type FormValues = z.infer<typeof schema>;

const homeByRole: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  GESTOR_PERSONAL: "/personal",
  SUPERVISOR_AUDITOR: "/supervisor",
};

export function LoginView() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login, isAuthed, role, hydrated } = useAuth();
  const navigate = useNavigate();

  if (hydrated && isAuthed && role) {
    return <Navigate to={homeByRole[role]} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", { method: "POST", body: values });
      login(res);
      toast.success("Bienvenido");
      navigate(homeByRole[res.usuario.rol], { replace: true });
    } catch (e) {
      if (isApiError(e)) {
        setErrorMsg(e.message);
      } else {
        setErrorMsg("No se pudo iniciar sesión. Inténtalo de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <section className="w-full max-w-[420px]">
      <div className="card">
        <header className="mb-4 text-center">
          <h1 className="text-heading-lg text-on-surface">Iniciar sesión</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">Acceso interno · Laboratorio XYZ</p>
        </header>
        {errorMsg ? <Alert tone="error" title="No fue posible iniciar sesión" className="mb-4">{errorMsg}</Alert> : null}
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <FormField id="email" label="Correo institucional" error={errors.email?.message} required>
            <input
              id="email"
              type="email"
              autoComplete="username"
              aria-invalid={!!errors.email}
              className="input"
              {...register("email")}
            />
          </FormField>
          <FormField id="password" label="Contraseña" error={errors.password?.message} required>
            <PasswordField
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <div className="flex items-center justify-between">
            <Link to="/configurar-contrasena" className="text-body-sm text-primary hover:underline">
              ¿Olvidó su contraseña?
            </Link>
          </div>
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            {submitting ? <Spinner /> : <Icon name="login" size="sm" />} Iniciar sesión
          </Button>
        </form>
      </div>
    </section>
  );
}
