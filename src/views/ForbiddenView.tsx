import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function ForbiddenView() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface text-on-surface">
      <div className="card max-w-md text-center">
        <h1 className="text-heading-lg">403</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          No tienes permisos para acceder a esta sección.
        </p>
        <Link to="/" className="mt-4 inline-block">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
