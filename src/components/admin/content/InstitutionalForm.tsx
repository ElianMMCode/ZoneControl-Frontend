import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { useContentMutations } from "@/hooks/useContentMutations";
import { toast } from "sonner";

const schema = z.object({
  mission: z.string().min(10, "Mínimo 10 caracteres"),
  vision: z.string().min(10, "Mínimo 10 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function InstitutionalForm({
  initial,
  onSaved,
}: {
  initial?: { mission?: string; vision?: string; description?: string };
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
      mission: initial?.mission ?? "",
      vision: initial?.vision ?? "",
      description: initial?.description ?? "",
    },
  });

  useEffect(() => {
    if (initial) {
      reset({
        mission: initial.mission ?? "",
        vision: initial.vision ?? "",
        description: initial.description ?? "",
      });
    }
  }, [initial, reset]);

  if (!initial) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const res = await updateSection("INSTITUTIONAL", {
      mission: values.mission,
      vision: values.vision,
      description: values.description,
    });
    if (res) {
      toast.success("Información institucional actualizada");
      onSaved();
    } else {
      toast.error("No se pudo actualizar");
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <FormField id="mission" label="Misión" error={errors.mission?.message} required>
        <Textarea id="mission" rows={4} {...register("mission")} />
      </FormField>
      <FormField id="vision" label="Visión" error={errors.vision?.message} required>
        <Textarea id="vision" rows={4} {...register("vision")} />
      </FormField>
      <FormField
        id="description"
        label="Descripción de la compañía"
        error={errors.description?.message}
        required
      >
        <Textarea id="description" rows={4} {...register("description")} />
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
