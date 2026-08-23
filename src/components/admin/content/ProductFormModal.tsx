import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import type { CatalogResponse, ProductRequest } from "@/types";

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
  removingImage,
  onRemoveImage,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductRequest, imageFile: File | null) => Promise<boolean>;
  initial?: Partial<CatalogResponse> | null;
  loading?: boolean;
  errorMessage?: string | null;
  removingImage?: boolean;
  onRemoveImage?: () => Promise<boolean>;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImageFile(null);
      setPreviewUrl(null);
    }
  }, [open, initial, reset]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const pickFile = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const submit = handleSubmit(async (values) => {
    const body: ProductRequest = {
      name: values.name,
      description: values.description,
      activeIngredient: values.activeIngredient,
      presentation: values.presentation,
      productionArea: values.productionArea,
    };
    const ok = await onSubmit(body, imageFile);
    if (ok) {
      pickFile(null);
      onClose();
    }
  });

  const handleRemoveImage = async () => {
    if (!onRemoveImage) return;
    const ok = await onRemoveImage();
    if (ok) pickFile(null);
  };

  const currentImage = previewUrl ?? initial?.imageUrl ?? null;

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
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-surface-container-highest ring-1 ring-outline-variant">
            {currentImage ? (
              <img src={currentImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <Icon name="medication" size="md" />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={loading || removingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="add_a_photo" size="sm" />{" "}
                {initial?.imageUrl || imageFile ? "Cambiar" : "Subir imagen"}
              </Button>
              {(initial?.imageUrl || imageFile) && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  loading={removingImage}
                  disabled={loading}
                  onClick={() =>
                    imageFile
                      ? pickFile(null)
                      : initial?.imageUrl
                        ? handleRemoveImage()
                        : undefined
                  }
                >
                  <Icon name="delete" size="sm" /> Quitar
                </Button>
              )}
            </div>
            {!initial && (
              <p className="text-body-sm text-on-surface-variant">
                La imagen se guardará al crear el producto (máx. 2MB).
              </p>
            )}
          </div>
        </div>
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
