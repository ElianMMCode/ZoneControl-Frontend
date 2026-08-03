import { RouterProvider, createBrowserRouter, useMatches } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { AppShell } from "@/components/layout/AppShell";
import { RequireAuth, RequireRole } from "./guards";
import { LoginView } from "@/views/auth/LoginView";
import { SetupPasswordView } from "@/views/auth/SetupPasswordView";
import { LandingView } from "@/views/public/LandingView";
import { AdminDashboard } from "@/views/admin/DashboardView";
import { UsersView } from "@/views/admin/UsersView";
import { CreateUserView } from "@/views/admin/CreateUserView";
import { EmployeeListView } from "@/views/personal/EmployeeListView";
import { SupervisorDashboard } from "@/views/supervisor/DashboardView";
import { NotFoundView } from "@/views/NotFoundView";
import type { Role } from "@/types";

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

const router = createBrowserRouter([
  { path: "/", element: <LandingView /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginView /> },
      { path: "/configurar-contrasena", element: <SetupPasswordView /> },
    ],
  },
  {
    element: <ShellWithTitle />,
    children: [
      {
        path: "/admin/dashboard",
        handle: { title: "Panel de Administración" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <AdminDashboard />
          </RequireRole>
        ),
      },
      {
        path: "/admin/usuarios",
        handle: { title: "Usuarios" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <UsersView />
          </RequireRole>
        ),
      },
      {
        path: "/admin/usuarios/nuevo",
        handle: { title: "Nuevo Usuario" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <CreateUserView />
          </RequireRole>
        ),
      },
      {
        path: "/personal",
        handle: { title: "Gestión de Personal" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <EmployeeListView />
          </RequireRole>
        ),
      },
      {
        path: "/supervisor",
        handle: { title: "Panel de Supervisión" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["SUPERVISOR_AUDITOR"] as ReadonlyArray<Role>}>
            <SupervisorDashboard />
          </RequireRole>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundView /> },
]);

export function AppRoutes() {
  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      <RouterProvider router={router} />
    </>
  );
}
