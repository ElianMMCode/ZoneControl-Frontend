import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dlg.addEventListener("cancel", onCancel);
    return () => dlg.removeEventListener("cancel", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-0 shadow-2xl backdrop:bg-inverse-surface/40",
        sizeClass[size],
      )}
    >
      <header className="flex items-start justify-between border-b border-outline-variant p-5">
        <div>
          <h2 id="modal-title" className="text-heading-md text-on-surface">
            {title}
          </h2>
          {description ? <p className="mt-1 text-body-sm text-on-surface-variant">{description}</p> : null}
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className="rounded-md p-1 text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="close" size="sm" />
        </button>
      </header>
      <div className="p-5">{children}</div>
      {footer ? (
        <footer className="flex justify-end gap-2 border-t border-outline-variant p-4">{footer}</footer>
      ) : null}
    </dialog>
  );
}
