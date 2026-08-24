import type { ReactNode } from "react";
import { Link, Outlet } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

export function SplitAuthLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="min-h-screen bg-public-surface text-public-on-surface">
      <div className="grid min-h-screen grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1">
        <div className="relative h-48 md:h-auto">
          <img
            src="/artix-home-process.jpg"
            alt="Equipo de laboratorio farmacéutico de Laboratorio XYZ"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/25 to-transparent" />
        </div>
        <section className="flex flex-col px-6 py-6 md:px-10 md:py-8">
          <header className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-body-md font-bold text-public-on-surface">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-public-primary text-public-on-primary">
                <Icon name="verified_user" size="md" />
              </span>
              Laboratorio XYZ
            </Link>
            <Link
              to="/"
              className="ml-auto flex items-center gap-1 text-body-sm text-public-on-surface-variant hover:text-public-on-surface"
            >
              <Icon name="arrow_back" size="sm" /> Volver al sitio
            </Link>
          </header>
          <main className="flex flex-1 items-center justify-center py-10">{children ?? <Outlet />}</main>
          <footer className="text-center text-body-sm text-on-surface-variant">
            Zona restringida solo para personal autorizado · v1.0.0
          </footer>
        </section>
      </div>
    </div>
  );
}
