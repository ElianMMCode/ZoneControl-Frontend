import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

export function NotFoundView() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface text-on-surface">
      <div className="card max-w-md text-center">
        <h1 className="text-heading-lg">404</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">La página que buscas no existe.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
