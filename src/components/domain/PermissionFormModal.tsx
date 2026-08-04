import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api";
import type {
  EmployeeSearchResponse,
  Page,
  PermissionResponse,
  ProductionArea,
} from "@/types";

export interface PermissionFormValues {
  employeeCode: string;
  productionAreaName: string;
  startDate: string;
  expirationDate: string;
  startTime: string;
  endTime: string;
}

const schema = z
  .object({
    employeeCode: z.string().min(1, "Selecciona un empleado"),
    productionAreaName: z.string().min(1, "Selecciona un área"),
    startDate: z.string().min(1, "Obligatorio"),
    expirationDate: z.string().min(1, "Obligatorio"),
    startTime: z.string().min(1, "Obligatorio"),
    endTime: z.string().min(1, "Obligatorio"),
  })
  .refine((v) => !v.startDate || !v.expirationDate || v.expirationDate >= v.startDate, {
    message: "La fecha de expiración debe ser posterior o igual al inicio",
    path: ["expirationDate"],
  })
  .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
    message: "La hora de fin debe ser posterior a la de inicio",
    path: ["endTime"],
  });

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PermissionFormValues) => Promise<boolean>;
  initial?: PermissionResponse | null;
  loading?: boolean;
  errorMessage?: string | null;
  areas: ProductionArea[];
  areasLoading?: boolean;
  showEmployeeSelector?: boolean;
  fixedEmployeeCode?: string;
};

export function PermissionFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  loading,
  errorMessage,
  areas,
  areasLoading,
  showEmployeeSelector = false,
  fixedEmployeeCode = "",
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      employeeCode: fixedEmployeeCode,
      productionAreaName: "",
      startDate: "",
      expirationDate: "",
      startTime: "",
      endTime: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        employeeCode: initial.employeeCode,
        productionAreaName: initial.areaName,
        startDate: initial.startDate,
        expirationDate: initial.expirationDate,
        startTime: initial.startTime.slice(0, 5),
        endTime: initial.endTime.slice(0, 5),
      });
    } else {
      reset({
        employeeCode: fixedEmployeeCode,
        productionAreaName: "",
        startDate: "",
        expirationDate: "",
        startTime: "",
        endTime: "",
      });
    }
  }, [open, initial, fixedEmployeeCode, reset]);

  const selectedEmployeeCode = watch("employeeCode");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Editar permiso de acceso" : "Otorgar permiso de acceso"}
      description={
        initial
          ? `${initial.employeeName} · ${initial.areaName}`
          : "Asigna acceso a un área restringida definiendo horarios y vigencia"
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(async (values) => {
              const ok = await onSubmit(values);
              if (ok) onClose();
            })}
            loading={loading}
          >
            {initial ? "Guardar cambios" : "Otorgar permiso"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()} noValidate>
        {showEmployeeSelector ? <EmployeeSelector value={selectedEmployeeCode} onChange={(code) => setValue("employeeCode", code, { shouldValidate: true })} /> : null}

        <FormField id="productionAreaName" label="Área de producción" error={errors.productionAreaName?.message} required>
          <Select
            id="productionAreaName"
            aria-invalid={!!errors.productionAreaName}
            disabled={areasLoading}
            {...register("productionAreaName")}
          >
            <Option value="">Selecciona un área</Option>
            {areas.map((a) => (
              <Option key={a.id} value={a.name}>
                {a.name}
              </Option>
            ))}
          </Select>
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField id="startDate" label="Fecha de inicio" error={errors.startDate?.message} required>
            <input id="startDate" type="date" className="input" aria-invalid={!!errors.startDate} {...register("startDate")} />
          </FormField>
          <FormField id="expirationDate" label="Fecha de expiración" error={errors.expirationDate?.message} required>
            <input id="expirationDate" type="date" className="input" aria-invalid={!!errors.expirationDate} {...register("expirationDate")} />
          </FormField>
          <FormField id="startTime" label="Hora inicio" error={errors.startTime?.message} required>
            <input id="startTime" type="time" className="input" aria-invalid={!!errors.startTime} {...register("startTime")} />
          </FormField>
          <FormField id="endTime" label="Hora fin" error={errors.endTime?.message} required>
            <input id="endTime" type="time" className="input" aria-invalid={!!errors.endTime} {...register("endTime")} />
          </FormField>
        </div>

        {errorMessage ? (
          <Alert tone="error" title="No se pudo guardar el permiso">
            {errorMessage}
          </Alert>
        ) : null}
      </form>
    </Modal>
  );
}

function EmployeeSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (employeeCode: string) => void;
}) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<EmployeeSearchResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    setError(null);
    apiFetch<Page<EmployeeSearchResponse>>("/api/personal", {
      query: { firstName: trimmed, page: 0, size: 10 },
      signal: ctrl.signal,
    })
      .then((res) => setResults(res.content))
      .catch(() => setError("No se pudo buscar el empleado"))
      .finally(() => setSearching(false));
    return () => ctrl.abort();
  }, [term]);

  const selected = results.find((e) => e.employeeCode === value) ?? null;

  return (
    <FormField id="employeeCode" label="Empleado" required>
      <input
        id="employeeCode"
        className="input"
        placeholder="Buscar por nombre…"
        value={selected ? `${selected.firstName} ${selected.lastName}` : term}
        onChange={(e) => {
          setTerm(e.target.value);
          if (value) onChange("");
        }}
      />
      {searching ? <div className="mt-2"><Skeleton className="h-8 w-full" /></div> : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      {term.trim().length >= 2 && !searching ? (
        <ul className="mt-2 max-h-48 divide-y divide-outline-variant overflow-auto rounded-md border border-outline-variant bg-surface-container-lowest">
          {results.length === 0 ? (
            <li className="px-3 py-2 text-body-sm text-on-surface-variant">Sin resultados</li>
          ) : (
            results.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(e.employeeCode);
                    setTerm(`${e.firstName} ${e.lastName}`);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-container"
                >
                  <span className="text-body-sm text-on-surface">
                    {e.firstName} {e.lastName}
                  </span>
                  <span className="font-mono text-body-sm text-on-surface-variant">
                    <Icon name="person" size="sm" className="mr-1 align-[-3px]" />
                    {e.employeeCode}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
      {selected ? (
        <p className="field-help">
          <Icon name="check_circle" size="sm" className="mr-1 align-[-3px] text-secondary" />
          {selected.employeeCode} · {selected.position} · {selected.departmentName}
        </p>
      ) : null}
    </FormField>
  );
}
