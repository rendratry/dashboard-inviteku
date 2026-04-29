"use client";

/**
 * Zustand auth store.
 * Persists the JWT token to localStorage so that sessions survive page refreshes.
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setToken: (token) =>
        set({ token, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "inviteku-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist token and user; isAuthenticated is derived
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

// ── Admin Auth Store ───────────────────────────────────────────────────────

interface AdminAuthState {
  adminToken: string | null;
  isAdminAuthenticated: boolean;

  // Actions
  setAdminToken: (token: string) => void;
  adminLogout: () => void;
}

export const useAdminStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      adminToken: null,
      isAdminAuthenticated: false,

      setAdminToken: (token) =>
        set({ adminToken: token, isAdminAuthenticated: true }),

      adminLogout: () =>
        set({ adminToken: null, isAdminAuthenticated: false }),
    }),
    {
      name: "inviteku-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminToken: state.adminToken,
        isAdminAuthenticated: state.isAdminAuthenticated,
      }),
    },
  ),
);
