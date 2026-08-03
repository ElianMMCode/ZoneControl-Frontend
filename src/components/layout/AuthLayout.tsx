import { Link, Outlet } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-public-surface text-public-on-surface">
      <header className="border-b border-outline-variant/50 bg-surface-container-lowest/60 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-6">
          <Link to="/" className="flex items-center gap-2 text-body-md font-bold text-public-on-surface">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-public-primary text-public-on-primary">
              <Icon name="verified_user" size="md" />
            </span>
            Laboratorio XYZ
          </Link>
          <Link to="/" className="ml-auto flex items-center gap-1 text-body-sm text-public-on-surface-variant hover:text-public-on-surface">
            <Icon name="arrow_back" size="sm" /> Volver al sitio
          </Link>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1280px] items-center justify-center px-6 py-12">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-[1280px] px-6 pb-6 text-center text-body-sm text-on-surface-variant">
        Zona restringida solo para personal autorizado · v1.0.0
      </footer>
    </div>
  );
}
