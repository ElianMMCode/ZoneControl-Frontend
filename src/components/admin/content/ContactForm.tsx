import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { useContentMutations } from "@/hooks/useContentMutations";
import { toast } from "sonner";

const schema = z.object({
  phone: z.string().min(7, "Teléfono inválido"),
  email: z.string().email("Email inválido"),
  socialMedia: z.string().min(2, "Ingresa una red social"),
});

type FormValues = z.infer<typeof schema>;

export function ContactForm({
  initial,
  onSaved,
}: {
  initial?: { phone?: string; email?: string; socialMedia?: string };
  onSaved: () => void;
}) {
  const { updateSection, loading, error } = useContentMutations();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      phone: initial?.phone ?? "",
      email: initial?.email ?? "",
      socialMedia: initial?.socialMedia ?? "",
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        phone: initial.phone ?? "",
        email: initial.email ?? "",
        socialMedia: initial.socialMedia ?? "",
      });
    }
  }, [initial, reset]);

  if (!initial) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const res = await updateSection("CONTACT", {
      phone: values.phone,
      email: values.email,
      socialMedia: values.socialMedia,
    });
    if (res) {
      toast.success("Datos de contacto actualizados");
      onSaved();
    } else {
      toast.error("No se pudo actualizar");
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <FormField id="phone" label="Teléfono" error={errors.phone?.message} required>
        <Input id="phone" {...register("phone")} />
      </FormField>
      <FormField id="email" label="Email" error={errors.email?.message} required>
        <Input id="email" type="email" {...register("email")} />
      </FormField>
      <FormField
        id="socialMedia"
        label="Redes sociales"
        error={errors.socialMedia?.message}
        required
      >
        <Input id="socialMedia" {...register("socialMedia")} placeholder="@LaboratorioXYZ" />
      </FormField>
      {error ? (
        <Alert tone="error" title="Error al guardar">
          {error.message}
        </Alert>
      ) : null}
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {loading ? <Spinner /> : null} Guardar cambios
        </Button>
      </div>
    </form>
  );
}
