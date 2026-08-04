import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

export type QuickAction = {
  label: string;
  icon: string;
  to: string;
  description?: string;
};

export function QuickActions({ title = "Accesos rápidos", actions }: { title?: string; actions: QuickAction[] }) {
  return (
    <section className="card">
      <header className="card-header">
        <h2 className="text-heading-md">{title}</h2>
      </header>
      <div className="flex flex-wrap gap-3">
        {actions.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            title={a.description}
            className="inline-flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low px-4 py-2 text-body-sm font-semibold text-on-surface transition-colors hover:border-primary hover:bg-primary-container/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon name={a.icon} size="sm" className="text-primary" />
            {a.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
