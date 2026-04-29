"use client";

/**
 * Admin Layout — wraps all /admin/dashboard/* pages.
 * Contains: AdminGuard, collapsible Sidebar, and Topbar (reused components).
 */

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck, CreditCard, ChevronLeft, LogOut, LayoutDashboard, Mail, Sparkles
} from "lucide-react";
import { useAdminStore } from "@/lib/store";

// ── AdminGuard ─────────────────────────────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAdminAuthenticated, adminToken } = useAdminStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAdminAuthenticated || !adminToken) {
      router.replace("/admin/login");
    }
  }, [hydrated, isAdminAuthenticated, adminToken, router]);

  if (!hydrated || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-pastel-gradient flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-bounce"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <ShieldCheck size={26} className="text-white" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-slate-soft">Loading Admin…</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// ── Admin Sidebar ──────────────────────────────────────────────────────────

const adminNavItems = [
  { href: "/admin/dashboard", exact: true, label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/dashboard/templates", label: "Template", icon: <Sparkles size={18} /> },
  { href: "/admin/dashboard/payments", label: "Pembayaran", icon: <CreditCard size={18} /> },
];

function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminLogout } = useAdminStore();

  const handleLogout = () => { adminLogout(); router.push("/admin/login"); };
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative flex-shrink-0 h-screen sticky top-0 flex flex-col overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(180,160,255,0.3)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-lavender-100/50 flex-shrink-0">
        <motion.div animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
          className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #d9c8ff 0%, #80cfff 100%)" }}>
            <ShieldCheck size={18} className="text-white" strokeWidth={1.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }}
                className="font-bold text-ink text-base whitespace-nowrap">
                Admin Panel
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
        <button id="admin-sidebar-toggle" onClick={onToggle}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-soft hover:bg-lavender-100 hover:text-lavender-500 transition-all ${collapsed ? "mx-auto" : "ml-auto"}`}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={14} strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>

      {/* Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-b border-lavender-100/50 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-lavender-500 bg-lavender-50 border border-lavender-200 rounded-full px-3 py-1">
              <ShieldCheck size={11} />Administrator
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-2 py-1 text-xs font-semibold text-slate-soft/60 uppercase tracking-wider">
              Navigation
            </motion.p>
          )}
        </AnimatePresence>
        {adminNavItems.map((item, i) => {
          const active = isActive(item.href, item.exact);
          return (
            <motion.div key={item.href} initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={item.href}
                id={`admin-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  active ? "sidebar-link-active" : "text-ink-muted hover:bg-lavender-50 hover:text-lavender-500"
                } ${collapsed ? "justify-center" : ""}`}>
                <span className={`flex-shrink-0 ${active ? "text-lavender-500" : "group-hover:text-lavender-500 transition-colors"}`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                      className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && collapsed && <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-lavender-400" />}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Back to user dashboard link */}
      <div className="px-2.5 pb-1">
        <Link href="/dashboard"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-soft hover:bg-baby-50 hover:text-baby-500 transition-all duration-200 text-xs ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "User Dashboard" : undefined}>
          <Mail size={16} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="whitespace-nowrap">
                User Dashboard
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Logout */}
      <div className="p-2.5 border-t border-lavender-100/50">
        <button id="admin-logout-btn" onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-soft hover:bg-red-50 hover:text-red-500 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout Admin" : undefined}>
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }} className="text-sm font-medium whitespace-nowrap">
                Logout Admin
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// ── Admin Topbar ───────────────────────────────────────────────────────────

function AdminTopbar({ pathname, onMenuClick }: { pathname: string; onMenuClick: () => void }) {
  const pageNames: Record<string, string> = {
    "/admin/dashboard": "Overview",
    "/admin/dashboard/payments": "Manajemen Pembayaran",
  };
  const title = pageNames[pathname] ?? "Admin";

  return (
    <header className="h-16 flex items-center px-4 sm:px-6 border-b flex-shrink-0 bg-white/70 backdrop-blur-md"
      style={{ borderColor: "rgba(180,160,255,0.2)" }}>
      <button id="admin-menu-btn" onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-soft hover:bg-lavender-100 hover:text-lavender-500 transition-all mr-3">
        <LayoutDashboard size={18} />
      </button>
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-lavender-400" />
        <span className="font-semibold text-ink text-sm">{title}</span>
      </div>
      <div className="ml-auto">
        <span className="text-xs text-slate-soft bg-lavender-50 border border-lavender-200 rounded-full px-3 py-1 font-medium">
          Admin Mode
        </span>
      </div>
    </header>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Login page: no guard, no sidebar — just render the page as-is
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:block">
          <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        </div>

        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-30 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)} />
              <motion.div initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full z-40 lg:hidden shadow-float">
                <AdminSidebar collapsed={false} onToggle={() => setMobileSidebarOpen(false)} />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminTopbar pathname={pathname} onMenuClick={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            <motion.div key={pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }} className="max-w-7xl mx-auto">
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
