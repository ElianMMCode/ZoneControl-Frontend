import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button, Spinner } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Input";
import { Select, Option } from "@/components/ui/Select";
import { Icon } from "@/components/ui/Icon";
import { isApiError } from "@/lib/api";
import {
  useDepartments,
  useEmployeeMutations,
  useOffices,
} from "@/hooks/useGestor";
import { CONTRACT_TYPE_LABELS, WORK_SHIFT_LABELS } from "@/types";
import type {
  ContractType,
  DocumentType,
  OfficeResponse,
  WorkShift,
} from "@/types";

export function RegisterEmployeeView() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    documentType: "CC" as DocumentType,
    documentNumber: "",
    firstName: "",
    lastName: "",
    position: "",
    departmentName: "",
    email: "",
    contractType: "" as "" | ContractType,
    baseOfficeName: "" as string,
    workShift: "" as "" | WorkShift,
    hireDate: "",
    contractEndDate: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = useDepartments();
  const offices = useOffices();
  const { register, uploadPhoto } = useEmployeeMutations();

  const onChange = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!form.documentNumber.trim()) {
      errs.documentNumber = "El número de documento es obligatorio";
    }
    if (form.firstName.trim().length < 2) {
      errs.firstName = "Los nombres deben tener al menos 2 caracteres";
    }
    if (form.lastName.trim().length < 2) {
      errs.lastName = "Los apellidos deben tener al menos 2 caracteres";
    }
    if (!form.position.trim()) {
      errs.position = "El cargo es obligatorio";
    }
    if (!form.departmentName) {
      errs.departmentName = "El departamento es obligatorio";
    }
    return errs;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      toast.error("Revisa los campos marcados");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const created = await register({
        documentType: form.documentType,
        documentNumber: form.documentNumber,
        firstName: form.firstName,
        lastName: form.lastName,
        position: form.position,
        departmentName: form.departmentName,
        email: form.email || undefined,
        contractType: form.contractType || undefined,
        baseOfficeName: form.baseOfficeName || undefined,
        workShift: form.workShift || undefined,
        hireDate: form.hireDate || undefined,
        contractEndDate: form.contractEndDate || undefined,
      });
      if (photoFile) {
        try {
          await uploadPhoto(created.id, photoFile);
        } catch {
          toast.warning("Empleado creado, pero la foto no se pudo subir");
        }
      }
      toast.success("Empleado registrado", {
        description: `Código generado: ${created.employeeCode}`,
      });
      navigate("/personal");
    } catch (err) {
      if (isApiError(err)) {
        toast.error(err.message);
      } else {
        toast.error("No se pudo registrar al empleado");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Personal"
        subtitle="Datos del empleado, contrato y fotografía"
        actions={
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <Icon name="arrow_back" size="sm" /> Volver
          </Button>
        }
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="card space-y-4">
          <h3 className="heading-sm text-on-surface">Datos personales</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField id="documentType" label="Tipo documento" required>
              <Select
                id="documentType"
                value={form.documentType}
                onChange={(e) => onChange("documentType", e.target.value as DocumentType)}
              >
                <Option value="CC">CC</Option>
                <Option value="CE">CE</Option>
                <Option value="TI">TI</Option>
                <Option value="PA">PA</Option>
                <Option value="RC">RC</Option>
              </Select>
            </FormField>
            <FormField id="documentNumber" label="Nº documento" error={fieldErrors.documentNumber} required>
              <input
                id="documentNumber"
                className="input"
                value={form.documentNumber}
                onChange={(e) => onChange("documentNumber", e.target.value)}
                maxLength={20}
                aria-invalid={!!fieldErrors.documentNumber}
              />
            </FormField>
            <FormField id="firstName" label="Nombres" error={fieldErrors.firstName} required>
              <input
                id="firstName"
                className="input"
                value={form.firstName}
                onChange={(e) => onChange("firstName", e.target.value)}
                maxLength={35}
                aria-invalid={!!fieldErrors.firstName}
              />
            </FormField>
            <FormField id="lastName" label="Apellidos" error={fieldErrors.lastName} required>
              <input
                id="lastName"
                className="input"
                value={form.lastName}
                onChange={(e) => onChange("lastName", e.target.value)}
                maxLength={35}
                aria-invalid={!!fieldErrors.lastName}
              />
            </FormField>
            <FormField id="position" label="Cargo" error={fieldErrors.position} required>
              <input
                id="position"
                className="input"
                value={form.position}
                onChange={(e) => onChange("position", e.target.value)}
                maxLength={30}
                aria-invalid={!!fieldErrors.position}
              />
            </FormField>
            <FormField id="departmentName" label="Departamento" error={fieldErrors.departmentName} required>
              <Select
                id="departmentName"
                value={form.departmentName}
                onChange={(e) => onChange("departmentName", e.target.value)}
                disabled={departments.loading}
                aria-invalid={!!fieldErrors.departmentName}
              >
                <Option value="">Seleccione…</Option>
                {departments.data?.map((d) => (
                  <Option key={d} value={d}>{d}</Option>
                ))}
              </Select>
            </FormField>
            <FormField id="email" label="Email">
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                placeholder="persona@correo.com"
              />
            </FormField>
          </div>
        </section>

        <section className="card space-y-4">
          <h3 className="heading-sm text-on-surface">Información del empleado</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField id="contractType" label="Tipo de contrato">
              <Select
                id="contractType"
                value={form.contractType}
                onChange={(e) => onChange("contractType", e.target.value as ContractType | "")}
              >
                <Option value="">— Sin definir —</Option>
                {(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map((c) => (
                  <Option key={c} value={c}>{CONTRACT_TYPE_LABELS[c]}</Option>
                ))}
              </Select>
            </FormField>
            <FormField id="baseOfficeName" label="Ubicación base / sede">
              <Select
                id="baseOfficeName"
                value={form.baseOfficeName}
                onChange={(e) => onChange("baseOfficeName", e.target.value)}
                disabled={offices.loading}
              >
                <Option value="">— Sin sede asignada —</Option>
                {offices.data?.map((o: OfficeResponse) => (
                  <Option key={o.id} value={o.name}>{o.name}</Option>
                ))}
              </Select>
            </FormField>
            <FormField id="workShift" label="Horario / turno">
              <Select
                id="workShift"
                value={form.workShift}
                onChange={(e) => onChange("workShift", e.target.value as WorkShift | "")}
              >
                <Option value="">— Sin definir —</Option>
                {(Object.keys(WORK_SHIFT_LABELS) as WorkShift[]).map((w) => (
                  <Option key={w} value={w}>{WORK_SHIFT_LABELS[w]}</Option>
                ))}
              </Select>
            </FormField>
            <FormField id="hireDate" label="Fecha de ingreso">
              <input
                id="hireDate"
                type="date"
                className="input"
                value={form.hireDate}
                onChange={(e) => onChange("hireDate", e.target.value)}
              />
            </FormField>
            <FormField id="contractEndDate" label="Fin de contrato">
              <input
                id="contractEndDate"
                type="date"
                className="input"
                value={form.contractEndDate}
                onChange={(e) => onChange("contractEndDate", e.target.value)}
              />
            </FormField>
          </div>
        </section>

        <section className="card space-y-4">
          <h3 className="heading-sm text-on-surface">Fotografía</h3>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-surface-container-highest ring-1 ring-outline-variant">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  aria-hidden
                  className="material-symbols-outlined !text-[64px] text-on-surface-variant"
                >
                  account_circle
                </span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-body-sm text-on-surface-variant">
                Sube una foto del empleado. Formatos: JPG, PNG o WebP. Tamaño máximo: 2 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onPhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="add_a_photo" size="sm" /> Seleccionar imagen
              </Button>
              {photoFile && (
                <p className="text-body-sm text-on-surface-variant">{photoFile.name}</p>
              )}
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner className="h-4 w-4" /> : <Icon name="save" size="sm" />}
            {submitting ? "Guardando…" : "Registrar empleado"}
          </Button>
        </div>
      </form>
    </div>
  );
}
