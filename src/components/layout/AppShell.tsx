import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { useAuth } from "@/hooks/useAuth";

interface Props {
  title: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (v: string) => void;
}

export function AppShell({ title, searchPlaceholder, searchValue, onSearch }: Props) {
  const { role } = useAuth();
  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar title={title} searchPlaceholder={searchPlaceholder} searchValue={searchValue} onSearch={onSearch} />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
