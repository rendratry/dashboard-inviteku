"use client";

/**
 * AuthGuard — wraps all dashboard pages.
 * Redirects unauthenticated users to /login and fetches the user profile on mount.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { getUserApi } from "@/lib/api";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, isAuthenticated, setUser, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Zustand persist hydration — waits for localStorage to be read
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Redirect if not authenticated after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated || !token) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, token, router]);

  // Fetch user profile on mount
  useEffect(() => {
    if (!hydrated || !token) return;

    getUserApi(token)
      .then((res) => {
        // Safe access to .data if it exists, otherwise use res as the user object
        const user = (res as any).data ?? res;
        setUser(user);
      })
      .catch(() => {
        // Token is invalid — force logout
        logout();
        router.replace("/login");
      });
  }, [hydrated, token, setUser, logout, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-pastel-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-bounce"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}>
            <Mail size={26} className="text-white" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-soft">Loading Inviteku…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
