import { Navigate, Route, Routes, BrowserRouter, useMatches } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireRole } from "./guards";
import { LoginView } from "@/views/auth/LoginView";
import { SetupPasswordView } from "@/views/auth/SetupPasswordView";
import { AdminDashboard } from "@/views/admin/DashboardView";
import { UsersView } from "@/views/admin/UsersView";
import { CreateUserView } from "@/views/admin/CreateUserView";
import { EmployeeListView } from "@/views/personal/EmployeeListView";
import { SupervisorDashboard } from "@/views/supervisor/DashboardView";
import { NotFoundView } from "@/views/NotFoundView";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

function RoleHome() {
  const { role, hydrated, isAuthed } = useAuth();
  if (!hydrated) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  const map: Record<Role, string> = {
    ADMIN: "/admin/dashboard",
    GESTOR_PERSONAL: "/personal",
    SUPERVISOR_AUDITOR: "/supervisor",
  };
  return <Navigate to={role ? map[role] : "/login"} replace />;
}

type RouteHandle = { title?: string };

function ShellWithTitle() {
  const matches = useMatches();
  const title = matches
    .slice()
    .reverse()
    .map((m) => (m.handle as RouteHandle | undefined)?.title)
    .find(Boolean) ?? "";
  return (
    <RequireAuth>
      <AppShell title={title} />
    </RequireAuth>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginView />} />
          <Route path="/configurar-contrasena" element={<SetupPasswordView />} />
        </Route>

        <Route element={<ShellWithTitle />}>
          <Route
            path="/admin/dashboard"
            handle={{ title: "Panel de Administración" } as RouteHandle}
            element={
              <RequireRole roles={["ADMIN"]}>
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/usuarios"
            handle={{ title: "Usuarios" } as RouteHandle}
            element={
              <RequireRole roles={["ADMIN"]}>
                <UsersView />
              </RequireRole>
            }
          />
          <Route
            path="/admin/usuarios/nuevo"
            handle={{ title: "Nuevo Usuario" } as RouteHandle}
            element={
              <RequireRole roles={["ADMIN"]}>
                <CreateUserView />
              </RequireRole>
            }
          />
          <Route
            path="/personal"
            handle={{ title: "Gestión de Personal" } as RouteHandle}
            element={
              <RequireRole roles={["ADMIN", "GESTOR_PERSONAL"]}>
                <EmployeeListView />
              </RequireRole>
            }
          />
          <Route
            path="/supervisor"
            handle={{ title: "Panel de Supervisión" } as RouteHandle}
            element={
              <RequireRole roles={["ADMIN", "SUPERVISOR_AUDITOR"]}>
                <SupervisorDashboard />
              </RequireRole>
            }
          />
        </Route>

        <Route path="/" element={<RoleHome />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </BrowserRouter>
  );
}
