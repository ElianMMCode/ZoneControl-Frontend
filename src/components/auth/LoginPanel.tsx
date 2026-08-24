import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PasswordField } from "@/components/common/PasswordField";
import { Alert } from "@/components/ui/Alert";
import { apiFetch, isApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { LoginResponse, Role } from "@/types";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type FormValues = z.infer<typeof schema>;

export const homeByRole: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  GESTOR_PERSONAL: "/personal",
  SUPERVISOR_AUDITOR: "/supervisor",
};

export function LoginPanel() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { email: "", password: "" } });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="space-y-4">
      {errorMsg ? <Alert tone="error" title="No fue posible iniciar sesión">{errorMsg}</Alert> : null}
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
        <Button
          type="submit"
          size="lg"
          loading={submitting}
          leadingIcon={<Icon name="login" size="sm" />}
          className="w-full"
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  );
}
