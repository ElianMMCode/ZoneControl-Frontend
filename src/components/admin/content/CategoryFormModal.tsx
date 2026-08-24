import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import type { CategoryRequest, CategoryResponse } from "@/types";

type FormValues = {
  name: string;
  description: string;
};

export function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryRequest) => Promise<boolean>;
  initial?: Partial<CategoryResponse> | null;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: initial?.name ?? "", description: initial?.description ?? "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: initial?.name ?? "", description: initial?.description ?? "" });
    }
  }, [open, initial, reset]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit({ name: values.name, description: values.description });
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? `Editar categoría: ${initial.name}` : "Nueva categoría"}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={loading}>
            {loading ? <Spinner /> : null} Guardar
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <FormField id="cat-name" label="Nombre" error={errors.name?.message} required>
          <Input id="cat-name" {...register("name")} />
        </FormField>
        <FormField id="cat-desc" label="Descripción" error={errors.description?.message}>
          <Textarea id="cat-desc" rows={3} {...register("description")} />
        </FormField>
        {errorMessage ? (
          <Alert tone="error" title="No se pudo guardar la categoría">
            {errorMessage}
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}
