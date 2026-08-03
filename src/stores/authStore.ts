import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LoginResponse, Role } from "@/types";

interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
}

interface AuthState {
  token: string | null;
  usuario: AuthUser | null;
  requirePasswordChange: boolean;
  isHydrated: boolean;
  login: (payload: LoginResponse) => void;
  logout: () => void;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      requirePasswordChange: false,
      isHydrated: false,
      login: (payload) =>
        set({
          token: payload.token,
          usuario: payload.usuario,
          requirePasswordChange: payload.requirePasswordChange,
        }),
      logout: () => set({ token: null, usuario: null, requirePasswordChange: false }),
      setHydrated: (v) => set({ isHydrated: v }),
    }),
    {
      name: "zc.auth",
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        requirePasswordChange: state.requirePasswordChange,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectToken = (s: AuthState) => s.token;
export const selectUser = (s: AuthState) => s.usuario;
export const selectRole = (s: AuthState) => s.usuario?.rol ?? null;
export const selectIsAuthed = (s: AuthState) => Boolean(s.token && s.usuario);
