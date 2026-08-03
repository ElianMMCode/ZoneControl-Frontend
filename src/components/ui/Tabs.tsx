import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  badge?: ReactNode;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;
  return (
    <div className={className}>
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-outline-variant">
        {items.map((it) => (
          <button
            key={it.id}
            role="tab"
            type="button"
            aria-selected={active === it.id}
            onClick={() => {
              setInternal(it.id);
              onChange?.(it.id);
            }}
            className={cn(
              "inline-flex items-center gap-2 border-b-2 px-3 py-2 text-body-sm font-semibold transition-colors",
              active === it.id
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-on-surface",
            )}
          >
            <span>{it.label}</span>
            {it.badge}
          </button>
        ))}
      </div>
    </div>
  );
}
