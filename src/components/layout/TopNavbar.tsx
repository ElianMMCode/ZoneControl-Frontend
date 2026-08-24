import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { SearchInput } from "@/components/common/SearchInput";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

const roleLabel: Record<Role, string> = {
  ADMIN: "Administrador",
  GESTOR_PERSONAL: "Gestor de Personal",
  SUPERVISOR_AUDITOR: "Supervisor / Auditor",
};

function initialsOf(name?: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopNavbar({ title, searchPlaceholder, searchValue, onSearch }: { title: string; searchPlaceholder?: string; searchValue?: string; onSearch?: (v: string) => void }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-6">
      <h1 className="text-heading-md text-on-surface">{title}</h1>
      {onSearch ? (
        <div className="ml-auto w-80 max-w-full">
          <SearchInput value={searchValue ?? ""} onChange={onSearch} placeholder={searchPlaceholder ?? "Buscar..."} />
        </div>
      ) : (
        <div className="ml-auto" />
      )}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          aria-label="Menú de usuario"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-body-sm font-bold text-on-primary-container transition-shadow hover:ring-2 hover:ring-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {initialsOf(user?.nombre)}
        </button>
        {menuOpen ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-lg"
          >
            <div className="px-4 py-3">
              <p className="truncate text-body-sm font-semibold text-on-surface">{user?.nombre ?? "Usuario"}</p>
              <p className="truncate text-body-sm text-on-surface-variant">{role ? roleLabel[role] : ""}</p>
            </div>
            <div className="border-t border-outline-variant/60" />
            <Link
              to="/ajustes"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-on-surface transition-colors hover:bg-surface-container"
            >
              <Icon name="settings" size="sm" /> Configuración
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-body-sm text-error transition-colors hover:bg-error-container/30"
            >
              <Icon name="logout" size="sm" /> Cerrar sesión
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
