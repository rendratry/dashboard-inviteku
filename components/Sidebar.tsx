"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Mail, User, Users, PenSquare, MessageCircle,
  ChevronLeft, LogOut,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

// ── Nav Items ──────────────────────────────────────────────────────────────

const navItems = [
  { href: "/dashboard", exact: true, label: "Overview", icon: <LayoutDashboard size={18} /> },
  { href: "/dashboard/undangan", label: "Buat Undangan", icon: <Mail size={18} /> },
  { href: "/dashboard/profile", label: "Profile", icon: <User size={18} /> },
  { href: "/dashboard/tamu", label: "Tamu (Guests)", icon: <Users size={18} /> },
  { href: "/dashboard/assets", label: "Undangan Assets", icon: <PenSquare size={18} /> },
  { href: "/dashboard/komentar", label: "Komentar", icon: <MessageCircle size={18} /> },
];

// ── Sidebar ────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/login"); };

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
        borderRight: "1px solid rgba(255,200,210,0.3)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-blush-100/50 flex-shrink-0">
        <motion.div
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
          className="flex items-center gap-3 w-full"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #ffc2cf 0%, #d9c8ff 100%)" }}
          >
            <Mail size={18} className="text-white" strokeWidth={1.5} />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-ink text-base whitespace-nowrap"
              >
                Inviteku
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse toggle */}
        <button
          id="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-soft hover:bg-blush-100 hover:text-blush-500 transition-all duration-200 ${collapsed ? "mx-auto" : "ml-auto"}`}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>

      {/* User mini-profile */}
      <AnimatePresence>
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 py-3 border-b border-blush-100/50 overflow-hidden"
          >
            <div className="flex items-center gap-2.5">
              <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
                <p className="text-xs text-slate-soft truncate">{user.email}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-3 space-y-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2 py-1 text-xs font-semibold text-slate-soft/60 uppercase tracking-wider"
            >
              Navigation
            </motion.p>
          )}
        </AnimatePresence>

        {navItems.map((item, i) => {
          const active = isActive(item.href, item.exact);
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  active
                    ? "sidebar-link-active"
                    : "text-ink-muted hover:bg-blush-50 hover:text-blush-500"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className={`flex-shrink-0 ${active ? "text-blush-500" : "group-hover:text-blush-500 transition-colors"}`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.18 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && collapsed && (
                  <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-blush-400" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2.5 border-t border-blush-100/50">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-soft hover:bg-red-50 hover:text-red-500 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

// ── UserAvatar ─────────────────────────────────────────────────────────────

export function UserAvatar({ name, avatar, size = "md" }: { name: string; avatar?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  if (avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatar} alt={name} className={`${sizeClasses[size]} rounded-xl object-cover flex-shrink-0`} />;
  }
  return (
    <div
      className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #ff9fb5 0%, #c2a7ff 100%)" }}
    >
      {initials}
    </div>
  );
}
