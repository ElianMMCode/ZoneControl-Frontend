import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import type { ProductRequest } from "@/types";

type FormValues = {
  name: string;
  description: string;
  activeIngredient: string;
  presentation: string;
  productionArea: string;
};

export function ProductFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductRequest) => Promise<boolean>;
  initial?: Partial<ProductRequest> | null;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      activeIngredient: initial?.activeIngredient ?? "",
      presentation: initial?.presentation ?? "",
      productionArea: initial?.productionArea ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        activeIngredient: initial?.activeIngredient ?? "",
        presentation: initial?.presentation ?? "",
        productionArea: initial?.productionArea ?? "",
      });
    }
  }, [open, initial, reset]);

  const submit = handleSubmit(async (values) => {
    const body: ProductRequest = {
      name: values.name,
      description: values.description,
      activeIngredient: values.activeIngredient,
      presentation: values.presentation,
      productionArea: values.productionArea,
    };
    const ok = await onSubmit(body);
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.name ? `Editar producto: ${initial.name}` : "Nuevo producto"}
      size="md"
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
        <FormField id="pr-name" label="Nombre" error={errors.name?.message} required>
          <Input id="pr-name" {...register("name")} />
        </FormField>
        <FormField id="pr-desc" label="Descripción" error={errors.description?.message}>
          <Input id="pr-desc" {...register("description")} />
        </FormField>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField id="pr-ai" label="Principio activo" error={errors.activeIngredient?.message}>
            <Input id="pr-ai" {...register("activeIngredient")} />
          </FormField>
          <FormField id="pr-pres" label="Presentación" error={errors.presentation?.message}>
            <Input id="pr-pres" {...register("presentation")} />
          </FormField>
        </div>
        <FormField id="pr-area" label="Área de producción" error={errors.productionArea?.message}>
          <Input id="pr-area" {...register("productionArea")} />
        </FormField>
        {errorMessage ? (
          <Alert tone="error" title="No se pudo guardar el producto">
            {errorMessage}
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}
