import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { Role } from "@/types";

const NAV_ITEMS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Quiénes Somos" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#sedes", label: "Sedes" },
  { href: "#contacto", label: "Contacto" },
];

const homeByRole: Record<Role, string> = {
  ADMIN: "/admin/dashboard",
  GESTOR_PERSONAL: "/personal",
  SUPERVISOR_AUDITOR: "/supervisor",
};

export function PublicNavbar() {
  const { isAuthed, role, hydrated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant/50 bg-surface-container-lowest/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center gap-6 px-6">
        <Link to="/#inicio" className="flex items-center gap-2 text-body-md font-bold text-public-on-surface">
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
        <div className="flex items-center gap-2 md:ml-0 ml-auto">
          {hydrated && isAuthed && role ? (
            <>
              <Link to={homeByRole[role]}>
                <Button variant="secondary" size="sm">
                  <Icon name="dashboard" size="sm" /> Mi panel
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Cerrar sesión">
                <Icon name="logout" size="sm" /> Salir
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="secondary" size="sm">
                <Icon name="login" size="sm" /> Iniciar sesión
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
