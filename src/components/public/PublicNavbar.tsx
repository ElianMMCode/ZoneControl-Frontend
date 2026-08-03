import { Link, useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Quiénes Somos" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#sedes", label: "Sedes" },
  { href: "#contacto", label: "Contacto" },
];

export function PublicNavbar() {
  const { isAuthed, role, hydrated } = useAuth();
  const location = useLocation();
  const isAdmin = role === "ADMIN";
  const internalHref = isAdmin
    ? "/admin/dashboard"
    : role === "GESTOR_PERSONAL"
      ? "/personal"
      : role === "SUPERVISOR_AUDITOR"
        ? "/supervisor"
        : null;

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant/50 bg-surface-container-lowest/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 text-body-md font-bold text-public-on-surface">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-public-primary text-public-on-primary">
            <Icon name="verified_user" size="md" />
          </span>
          Laboratorio XYZ
        </Link>
        <nav aria-label="Navegación pública" className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-body-sm text-public-on-surface-variant hover:bg-surface-container hover:text-public-on-surface"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {hydrated && isAuthed && internalHref ? (
            <Link
              to={internalHref}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-md bg-public-primary px-4 text-body-sm font-semibold text-public-on-primary hover:bg-public-primary-container",
              )}
            >
              <Icon name="space_dashboard" size="sm" /> Ir al panel
            </Link>
          ) : (
            <Link
              to={`/login${location.search || ""}`}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-public-primary px-4 text-body-sm font-semibold text-public-on-primary hover:bg-public-primary-container"
            >
              <Icon name="login" size="sm" /> Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
