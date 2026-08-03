import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { SearchInput } from "@/components/common/SearchInput";
import { useAuth } from "@/hooks/useAuth";

export function TopNavbar({ title, searchPlaceholder, searchValue, onSearch }: { title: string; searchPlaceholder?: string; searchValue?: string; onSearch?: (v: string) => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-outline-variant bg-surface-container-lowest px-6">
      <h1 className="text-heading-md text-on-surface">{title}</h1>
      {onSearch ? (
        <div className="ml-auto w-80 max-w-full">
          <SearchInput value={searchValue ?? ""} onChange={onSearch} placeholder={searchPlaceholder ?? "Buscar..."} />
        </div>
      ) : (
        <div className="ml-auto" />
      )}
      <div className="flex items-center gap-3">
        <span className="hidden text-body-sm text-on-surface-variant sm:inline">{user?.nombre ?? "—"}</span>
        <button
          type="button"
          aria-label="Cerrar sesión"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Icon name="logout" size="sm" />
        </button>
      </div>
    </header>
  );
}
