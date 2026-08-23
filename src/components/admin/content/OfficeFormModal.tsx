import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import type { OfficeRequest, OfficeResponse } from "@/types";

type FormValues = {
  name: string;
  address: string;
  openingHours: string;
  latitude: number | "";
  longitude: number | "";
};

export function OfficeFormModal({
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
  onSubmit: (values: OfficeRequest, imageFile: File | null) => Promise<boolean>;
  initial?: Partial<OfficeResponse> | null;
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
      address: initial?.address ?? "",
      openingHours: initial?.openingHours ?? "",
      latitude: initial?.latitude ?? "",
      longitude: initial?.longitude ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? "",
        address: initial?.address ?? "",
        openingHours: initial?.openingHours ?? "",
        latitude: initial?.latitude ?? "",
        longitude: initial?.longitude ?? "",
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
    const body: OfficeRequest = {
      name: values.name,
      address: values.address,
      openingHours: values.openingHours,
      latitude: values.latitude === "" || values.latitude == null ? null : Number(values.latitude),
      longitude:
        values.longitude === "" || values.longitude == null ? null : Number(values.longitude),
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
      title={initial?.name ? `Editar sede: ${initial.name}` : "Nueva sede"}
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
              <Icon name="location_on" size="md" />
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
                La imagen se guardará al crear la sede (máx. 2MB).
              </p>
            )}
          </div>
        </div>
        <FormField id="of-name" label="Nombre" error={errors.name?.message} required>
          <Input id="of-name" {...register("name")} />
        </FormField>
        <FormField id="of-address" label="Dirección" error={errors.address?.message} required>
          <Input id="of-address" {...register("address")} />
        </FormField>
        <FormField id="of-hours" label="Horario" error={errors.openingHours?.message}>
          <Input id="of-hours" placeholder="Lun-Vie 8:00-17:00" {...register("openingHours")} />
        </FormField>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField id="of-lat" label="Latitud">
            <Input id="of-lat" type="number" step="any" {...register("latitude")} />
          </FormField>
          <FormField id="of-lng" label="Longitud">
            <Input id="of-lng" type="number" step="any" {...register("longitude")} />
          </FormField>
        </div>
        {errorMessage ? (
          <Alert tone="error" title="No se pudo guardar la sede">
            {errorMessage}
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}
