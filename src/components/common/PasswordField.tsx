import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

export function PasswordField(props: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant hover:text-on-surface"
      >
        <Icon name={visible ? "visibility_off" : "visibility"} size="sm" />
      </button>
    </div>
  );
}
