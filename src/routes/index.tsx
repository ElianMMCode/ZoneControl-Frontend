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
import { PublicContentView } from "@/views/admin/PublicContentView";
import { AdminAreasView } from "@/views/admin/AdminAreasView";
import { AdminCargosView } from "@/views/admin/AdminCargosView";
import { EmployeeListView } from "@/views/personal/EmployeeListView";
import { RegisterEmployeeView } from "@/views/personal/RegisterEmployeeView";
import { BulkUploadView } from "@/views/personal/BulkUploadView";
import { EmployeeDetailView } from "@/views/personal/EmployeeDetailView";
import { PermissionsView } from "@/views/personal/PermissionsView";
import { AccessHistoryView } from "@/views/personal/AccessHistoryView";
import { PartnerExportView } from "@/views/personal/PartnerExportView";
import { SupervisorDashboard } from "@/views/supervisor/DashboardView";
import { AccessValidationView } from "@/views/supervisor/AccessValidationView";
import { ReportsView } from "@/views/supervisor/ReportsView";
import { ZonesView } from "@/views/supervisor/ZonesView";
import { RoleMatrixView } from "@/views/admin/RoleMatrixView";
import { SettingsView } from "@/views/settings/SettingsView";
import { NotFoundView } from "@/views/NotFoundView";
import { ForbiddenView } from "@/views/ForbiddenView";
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
        path: "/admin/contenido-publico",
        handle: { title: "Contenido Público" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <PublicContentView />
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
        path: "/personal/nuevo",
        handle: { title: "Registrar Personal" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <RegisterEmployeeView />
          </RequireRole>
        ),
      },
      {
        path: "/personal/carga-masiva",
        handle: { title: "Carga Masiva" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <BulkUploadView />
          </RequireRole>
        ),
      },
      {
        path: "/personal/:id",
        handle: { title: "Detalle de Empleado" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <EmployeeDetailView />
          </RequireRole>
        ),
      },
      {
        path: "/permisos",
        handle: { title: "Gestión de Permisos" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <PermissionsView />
          </RequireRole>
        ),
      },
      {
        path: "/personal/historial",
        handle: { title: "Historial de Accesos" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <AccessHistoryView />
          </RequireRole>
        ),
      },
      {
        path: "/personal/socio",
        handle: { title: "Archivo para Socio" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "GESTOR_PERSONAL"] as ReadonlyArray<Role>}>
            <PartnerExportView />
          </RequireRole>
        ),
      },
      {
        path: "/admin/areas",
        handle: { title: "Áreas de Producción" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <AdminAreasView />
          </RequireRole>
        ),
      },
      {
        path: "/admin/cargos",
        handle: { title: "Cargos" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <AdminCargosView />
          </RequireRole>
        ),
      },
      {
        path: "/admin/matriz-roles",
        handle: { title: "Matriz de Roles" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN"] as ReadonlyArray<Role>}>
            <RoleMatrixView />
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
      {
        path: "/supervisor/validar",
        handle: { title: "Validación de Credenciales" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "SUPERVISOR_AUDITOR"] as ReadonlyArray<Role>}>
            <AccessValidationView />
          </RequireRole>
        ),
      },
      {
        path: "/supervisor/reportes",
        handle: { title: "Reportes de Auditoría" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "SUPERVISOR_AUDITOR"] as ReadonlyArray<Role>}>
            <ReportsView />
          </RequireRole>
        ),
      },
      {
        path: "/supervisor/zones",
        handle: { title: "Zonas en vivo" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "SUPERVISOR_AUDITOR"] as ReadonlyArray<Role>}>
            <ZonesView />
          </RequireRole>
        ),
      },
      {
        path: "/ajustes",
        handle: { title: "Ajustes y Perfil" } satisfies RouteHandle,
        element: (
          <RequireRole roles={["ADMIN", "GESTOR_PERSONAL", "SUPERVISOR_AUDITOR"] as ReadonlyArray<Role>}>
            <SettingsView />
          </RequireRole>
        ),
      },
    ],
  },
  { path: "/403", element: <ForbiddenView /> },
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
