import { useEffect } from "react";
import { setAuthTokenGetter } from "@/lib/api";
import { useAuthStore, selectIsAuthed, selectRole, selectUser, selectToken } from "@/stores/authStore";

let registered = false;

export function useAuth() {
  const isAuthed = useAuthStore(selectIsAuthed);
  const role = useAuthStore(selectRole);
  const user = useAuthStore(selectUser);
  const token = useAuthStore(selectToken);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const hydrated = useAuthStore((s) => s.isHydrated);

  useEffect(() => {
    if (registered) return;
    registered = true;
    setAuthTokenGetter(() => useAuthStore.getState().token);
  }, []);

  return { isAuthed, role, user, token, login, logout, hydrated };
}
