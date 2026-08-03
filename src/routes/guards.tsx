import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";
import { Spinner } from "@/components/ui/Button";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed, hydrated } = useAuth();
  const location = useLocation();
  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export function RequireRole({ roles, children }: { roles: ReadonlyArray<Role>; children: ReactNode }) {
  const { role, isAuthed, hydrated } = useAuth();
  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }
  if (!isAuthed) return <Navigate to="/login" replace />;
  if (!role || !roles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
