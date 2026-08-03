import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import type { OfficeRequest } from "@/types";

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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: OfficeRequest) => Promise<boolean>;
  initial?: Partial<OfficeRequest> | null;
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
    }
  }, [open, initial, reset]);

  const submit = handleSubmit(async (values) => {
    const body: OfficeRequest = {
      name: values.name,
      address: values.address,
      openingHours: values.openingHours,
      latitude: values.latitude === "" || values.latitude == null ? null : Number(values.latitude),
      longitude: values.longitude === "" || values.longitude == null ? null : Number(values.longitude),
    };
    const ok = await onSubmit(body);
    if (ok) onClose();
  });

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
