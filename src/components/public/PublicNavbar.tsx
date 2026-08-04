import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

const NAV_ITEMS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Quiénes Somos" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#sedes", label: "Sedes" },
  { href: "#contacto", label: "Contacto" },
];

export function PublicNavbar() {
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
      </div>
    </header>
  );
}
