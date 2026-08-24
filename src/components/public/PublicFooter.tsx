import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";

const panelByRole: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  GESTOR_PERSONAL: "/personal",
  SUPERVISOR_AUDITOR: "/supervisor",
};

export function PublicFooter() {
  const { isAuthed, role, hydrated } = useAuth();
  const internalHref =
    hydrated && isAuthed && role ? panelByRole[role] : "/login";
  return (
    <footer className="border-t border-outline-variant/50 bg-public-surface">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-body-md font-bold text-public-on-surface">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-public-primary text-public-on-primary">
              <Icon name="verified_user" size="md" />
            </span>
            Laboratorio XYZ
          </div>
          <p className="mt-3 text-body-sm text-public-on-surface-variant">
            Compañía farmacéutica colombiana especializada en medicamentos
            de alto costo para enfermedades crónicas y huérfanas.
          </p>
        </div>
        <div>
          <h3 className="label-caps text-public-on-surface">Enlaces</h3>
          <ul className="mt-3 space-y-1 text-body-sm">
            <li><Link to="/#quienes-somos" className="text-public-on-surface-variant hover:text-public-primary">Quiénes Somos</Link></li>
            <li><Link to="/#catalogo" className="text-public-on-surface-variant hover:text-public-primary">Catálogo</Link></li>
            <li><Link to="/#sedes" className="text-public-on-surface-variant hover:text-public-primary">Sedes</Link></li>
            <li><Link to="/#contacto" className="text-public-on-surface-variant hover:text-public-primary">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="label-caps text-public-on-surface">Legal</h3>
          <ul className="mt-3 space-y-1 text-body-sm">
            <li><Link to={internalHref} className="text-public-on-surface-variant hover:text-public-primary">Acceso Interno</Link></li>
            <li className="text-public-on-surface-variant">NIT 900.123.456-7</li>
            <li className="text-public-on-surface-variant">Vigilado por INVIMA</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-variant/40">
        <p className="mx-auto max-w-[1280px] px-6 py-4 text-center text-body-sm text-public-on-surface-variant">
          © {new Date().getFullYear()} Laboratorio XYZ. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
