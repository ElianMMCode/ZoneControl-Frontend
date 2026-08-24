import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { LoginPanel, homeByRole } from "@/components/auth/LoginPanel";
import { AccessKioskPanel } from "@/components/auth/AccessKioskPanel";

const TAB_ITEMS = [
  { id: "login", label: "Iniciar sesión", icon: "login" },
  { id: "validar", label: "Validar acceso", icon: "door_front" },
];

export function LoginView() {
  const [tab, setTab] = useState("login");
  const { isAuthed, role, hydrated } = useAuth();

  if (hydrated && isAuthed && role) {
    return <Navigate to={homeByRole[role]} replace />;
  }

  return (
    <section className="w-full max-w-[440px]">
      <header className="mb-6 text-center">
        <h1 className="text-heading-lg text-on-surface">Acceso interno</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Acceso exclusivo para el personal interno de Laboratorio XYZ
        </p>
        <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-surface-container px-3 py-1.5 text-body-sm text-on-surface-variant">
          <Icon name="info" size="sm" />
          Este portal no es para visitantes; si deseas conocernos, vuelve al{" "}
          <Link to="/" className="text-primary hover:underline">
            sitio público
          </Link>
        </p>
      </header>
      <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} className="mb-6" />
      {tab === "login" ? <LoginPanel /> : <AccessKioskPanel />}
    </section>
  );
}
